<p align="center">
  <h1 align="center">⚡ Relay</h1>
  <p align="center">
    A horizontally-scalable, real-time chat platform built on WebSockets, Redis Pub/Sub, and Redis Streams with guaranteed message delivery to PostgreSQL.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Redis-Streams%20%2B%20Pub%2FSub-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Turborepo-2.x-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Bun-1.4-F9F1E1?logo=bun&logoColor=black" alt="Bun" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [High-Level System Design](#high-level-system-design)
  - [Message Flow — Pub/Sub for WebSocket Scalability](#message-flow--pubsub-for-websocket-scalability)
  - [Persistence Pipeline — Redis Streams + Worker](#persistence-pipeline--redis-streams--worker)
  - [Authentication Flow](#authentication-flow)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
  - [Apps](#apps)
  - [Packages](#packages)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [WebSocket Protocol](#websocket-protocol)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

**Relay** is a real-time group chat application engineered for horizontal scalability. Instead of coupling WebSocket connections to a single server, Relay uses **Redis Pub/Sub** to broadcast messages across multiple WS server instances and **Redis Streams** with a dedicated **worker process** to durably persist messages to **PostgreSQL** — with built-in failure recovery and exactly-once delivery guarantees.

### Key Design Decisions

| Problem | Solution |
|---|---|
| Single WS server doesn't scale | **Redis Pub/Sub** broadcasts messages across all WS instances |
| Direct DB writes from WS create backpressure | **Redis Streams** buffer messages; a decoupled **worker** drains them to PostgreSQL |
| Worker crashes lose messages | **Consumer Groups + XACK** — unacknowledged messages are re-processed on restart |
| Duplicate writes on retry | **Unique `eventId`** per message + Prisma `P2002` duplicate detection → idempotent writes |
| JWT expires mid-session | WS server sends `TOKEN_EXPIRING` warning 60s before expiry so the client can refresh |

---

## Architecture

### High-Level System Design

```mermaid
graph TB
    subgraph Clients
        C1["Browser Client A"]
        C2["Browser Client B"]
        C3["Browser Client N"]
    end

    subgraph "Frontend (Vite + React)"
        WEB["web<br/>React 19 · Vite · TailwindCSS<br/>Zustand · Axios"]
    end

    subgraph "Backend Services"
        HTTP["http-server<br/>Express 5 REST API<br/>Auth · Rooms · Users"]
        WS1["ws-server Instance 1<br/>WebSocket Server"]
        WS2["ws-server Instance N<br/>WebSocket Server"]
    end

    subgraph "Redis"
        PUBSUB["Redis Pub/Sub<br/>Channel per room<br/>chat:room:{roomId}"]
        STREAM["Redis Streams<br/>chat-events stream"]
    end

    subgraph "Worker"
        W["chat-worker<br/>Consumer Group: chat-workers<br/>Processes pending + new events"]
    end

    subgraph "Database"
        PG["PostgreSQL<br/>Users · Rooms · Chats<br/>Prisma 7 ORM"]
    end

    C1 & C2 & C3 --> WEB
    WEB -- "REST API (HTTP)" --> HTTP
    WEB -- "WebSocket" --> WS1 & WS2
    HTTP -- "Prisma queries" --> PG
    WS1 & WS2 -- "PUBLISH" --> PUBSUB
    PUBSUB -- "SUBSCRIBE" --> WS1 & WS2
    WS1 & WS2 -- "XADD" --> STREAM
    STREAM -- "XREADGROUP" --> W
    W -- "Prisma insert + XACK" --> PG
    W -- "XACK" --> STREAM

    style PUBSUB fill:#dc382d,color:#fff
    style STREAM fill:#dc382d,color:#fff
    style PG fill:#336791,color:#fff
    style WEB fill:#61dafb,color:#000
    style HTTP fill:#000,color:#fff
    style WS1 fill:#000,color:#fff
    style WS2 fill:#000,color:#fff
    style W fill:#f59e0b,color:#000
```

### Message Flow — Pub/Sub for WebSocket Scalability

When multiple WS server instances are running, a client connected to **Instance 1** sends a message, but the recipient is on **Instance 2**. Redis Pub/Sub solves this:

```mermaid
sequenceDiagram
    participant Client A
    participant WS Server 1
    participant Redis Pub/Sub
    participant WS Server 2
    participant Client B

    Client A->>WS Server 1: Send chat message
    Note over WS Server 1: Broadcast to local room sockets
    WS Server 1->>Redis Pub/Sub: PUBLISH chat:room:{roomId}
    Note over WS Server 1: Payload includes serverId to avoid self-echo
    Redis Pub/Sub->>WS Server 2: MESSAGE on chat:room:{roomId}
    Note over WS Server 2: Skip if serverId matches own ID
    WS Server 2->>Client B: Forward message to room sockets
```

Each WS server instance has a **unique UUID** (`WS_SERVER_ID`). When it receives its own published message back via the subscription, it skips forwarding — preventing duplicate delivery to local clients.

### Persistence Pipeline — Redis Streams + Worker

Messages are not written to PostgreSQL directly from the WS server. Instead, they flow through Redis Streams for reliable, asynchronous persistence:

```mermaid
sequenceDiagram
    participant WS Server
    participant Redis Stream
    participant Chat Worker
    participant PostgreSQL

    WS Server->>Redis Stream: XADD chat-events * id, message, roomId

    Note over Chat Worker: On startup — drain pending messages first
    Chat Worker->>Redis Stream: XREADGROUP GROUP chat-workers worker-1 ... "0"
    Redis Stream-->>Chat Worker: Pending (unACKed) messages
    Chat Worker->>PostgreSQL: prisma.chat.create({ eventId, ... })
    Chat Worker->>Redis Stream: XACK chat-events chat-workers {messageId}

    Note over Chat Worker: Then block for new messages
    Chat Worker->>Redis Stream: XREADGROUP GROUP chat-workers worker-1 BLOCK 5000 ... ">"
    Redis Stream-->>Chat Worker: New messages
    Chat Worker->>PostgreSQL: prisma.chat.create({ eventId, ... })
    Chat Worker->>Redis Stream: XACK chat-events chat-workers {messageId}

    Note over Chat Worker: On duplicate (P2002) — ACK and skip
```

**Failure recovery**: If the worker crashes mid-batch, unACKed messages remain in the pending entries list (PEL). On restart, the worker reads with offset `"0"` first, re-processing all pending entries before switching to `">"` for new ones. Duplicate inserts are caught via the unique `eventId` constraint (`P2002` error) and silently ACKed.

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant HTTP Server
    participant WS Server

    Note over Client,HTTP Server: REST Authentication
    Client->>HTTP Server: POST /user/signin { email, password }
    HTTP Server-->>Client: Set-Cookie: access_token, refresh_token
    HTTP Server-->>Client: { token: access_token }

    Note over Client,WS Server: WebSocket Authentication
    Client->>WS Server: Connect via WebSocket
    Client->>WS Server: First message: { type: "AUTH", token: "..." }
    WS Server->>WS Server: Verify JWT access token
    WS Server-->>Client: { type: "AUTH_SUCCESS" }
    
    Note over WS Server: Set timer for 60s before token expiry
    WS Server-->>Client: { type: "TOKEN_EXPIRING", expiresIn: 60 }
    Client->>HTTP Server: POST /user/refresh
    HTTP Server-->>Client: New access_token
```

The HTTP server uses **dual-token rotation**: short-lived access tokens + longer-lived refresh tokens in `httpOnly` cookies. The auth middleware automatically rotates an expired access token if a valid refresh token exists.

The WS server authenticates via the **first message** after connection — the client must send its access token in an `AUTH` message. The server proactively warns the client 60 seconds before the token expires.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | Turborepo 2.x + Bun workspaces |
| **Frontend** | React 19, Vite 8, TailwindCSS 3, Zustand, Axios, Framer Motion, GSAP |
| **HTTP API** | Express 5, bcrypt, JWT (access + refresh tokens), express-rate-limit |
| **WebSocket** | Node.js `ws` library, Express HTTP server upgrade |
| **Message Broker** | Redis Pub/Sub (ioredis 6) — cross-instance message fan-out |
| **Message Queue** | Redis Streams — durable, ordered event log with consumer groups |
| **Worker** | Standalone Node.js process — drains Redis Streams → PostgreSQL |
| **Database** | PostgreSQL (>= 15) via Prisma 7 with `@prisma/adapter-pg` |
| **Validation** | Zod 4 — shared schemas across frontend, backend, and WebSocket layer |
| **Language** | TypeScript 7 throughout |

---

## Monorepo Structure

```
relay/
├── apps/
│   ├── web/                    # React SPA (Vite)
│   ├── http-server/            # Express REST API
│   ├── ws-server/              # WebSocket server
│   └── chat-worker/            # Redis Streams → PostgreSQL worker
├── packages/
│   ├── api_contracts/          # Shared Zod schemas (validation + types)
│   ├── codes/                  # HTTP status codes + application error codes
│   ├── db/                     # Prisma client, schema, migrations
│   ├── redis/                  # Redis client (ioredis) — publisher, subscriber, stream
│   ├── ui/                     # Shared UI component library
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared tsconfig base files
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Root workspace config
└── bun.lock                    # Bun lockfile
```

### Apps

#### `apps/web` — Frontend SPA
The client-side application built with **React 19** and **Vite**.

| Concern | Implementation |
|---|---|
| Routing | `react-router-dom` v7 (Home, SignIn, SignUp, Dashboard, Room) |
| State | Zustand store for auth state |
| Data fetching | Axios (centralized instance with interceptors) |
| Styling | TailwindCSS 3 + Framer Motion + GSAP + Lenis smooth scroll |
| Forms | React Hook Form + Zod resolvers |
| Protected routes | `ProtectedRoute` component wrapping authenticated pages |
| Deployment | Vercel-ready (`vercel.json` present) |

#### `apps/http-server` — REST API
Express 5 server handling all CRUD operations and authentication.

| Route | Method | Auth | Description |
|---|---|---|---|
| `/user/signup` | POST | ✗ | Register a new user |
| `/user/signin` | POST | ✗ | Sign in, returns JWT cookies |
| `/user/refresh` | POST | ✓ | Rotate access token |
| `/user/logout` | POST | ✗ | Clear auth cookies |
| `/room/create-room` | POST | ✓ | Create a new chat room |
| `/room/get-room` | GET | ✗ | Paginated room listing with search |
| `/room/delete-room/:id` | DELETE | ✓ | Delete room (admin only) |
| `/health` | GET | ✗ | Health check |

**Middleware stack**: CORS → rate limiter (100 req/min global, 10 signin/15min, 20 room-create/min) → cookie parser → JSON body parser → route handlers → centralized error handler (`AppError` class).

#### `apps/ws-server` — WebSocket Server
Handles real-time bidirectional communication.

**Connection lifecycle**:
1. Client connects → must send `{ type: "AUTH", token: "..." }` as the first message
2. Server verifies JWT → sends `AUTH_SUCCESS` or closes the connection
3. Client sends typed messages: `join-room`, `chat`, `leave-room`
4. On `chat`: message is broadcast to local room sockets, published to Redis Pub/Sub, and added to Redis Streams
5. On incoming Pub/Sub message: forwarded to local room sockets (skips self via `serverId` check)

**Room management**: In-memory `Map<roomId, Set<WebSocket>>`. When the first socket joins a room, the server subscribes to `chat:room:{roomId}`. When the last socket leaves, it unsubscribes.

#### `apps/chat-worker` — Persistence Worker
A standalone long-running process that drains the `chat-events` Redis Stream into PostgreSQL.

**Startup sequence**:
1. Check if consumer group `chat-workers` exists → create with `MKSTREAM` if not
2. **Drain pending entries** — read all unACKed messages (offset `"0"`) and process them
3. **Block for new messages** — `XREADGROUP ... BLOCK 5000 ... ">"` in an infinite loop
4. For each message: insert into `Chat` table → `XACK` on success
5. On `P2002` (duplicate `eventId`): ACK and continue silently — idempotent by design

### Packages

| Package | Name | Purpose |
|---|---|---|
| `@repo/api_contracts` | API Contracts | Zod schemas shared across frontend + backend — `SignupSchema`, `SigninSchema`, `roomSchema`, `SocketDataSchema`, `AuthDataSchema`, `TokenExpiringSchema` |
| `@repo/codes` | Codes | Centralized HTTP status codes and application error codes (`ERROR_CODES`) — type-safe constants used by both `http-server` and `ws-server` |
| `@repo/db` | Database | Prisma 7 client setup using `@prisma/adapter-pg` with connection string config, singleton pattern for dev, schema + migrations + seed script |
| `@repo/redis` | Redis | ioredis client factory exporting three connections: `redis` (streams), `publisher` (Pub/Sub publish), `subscriber` (Pub/Sub subscribe) — with singleton caching in dev |
| `ui` | UI | Shared React component library |
| `eslint-config` | ESLint Config | Shared linting rules |
| `typescript-config` | TS Config | Base `tsconfig.json` presets |

---

## Database Schema

```mermaid
erDiagram
    User {
        String id PK "UUID"
        String email UK
        String name
        String password "bcrypt hash"
        DateTime createdAt
        DateTime updatedAt
    }

    Room {
        Int id PK "autoincrement"
        String room_name UK
        String adminId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Chat {
        Int id PK "autoincrement"
        String eventId UK "Redis Stream message ID"
        String message
        String userId FK
        Int roomId FK
        DateTime createdAt
        DateTime updatedAt
    }

    User ||--o{ Room : "admin (RoomAdmin)"
    User }o--o{ Room : "member (RoomMembers)"
    User ||--o{ Chat : "author"
    Room ||--o{ Chat : "contains"
```

The `Chat.eventId` field stores the Redis Stream message ID — this serves as a natural deduplication key. If the worker crashes and replays pending messages, the `@unique` constraint on `eventId` prevents double-writes.

---

## API Reference

### Authentication

**Sign Up**
```http
POST /user/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Sign In**
```http
POST /user/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
Response sets `access_token` and `refresh_token` as `httpOnly` cookies.

**Refresh Token**
```http
POST /user/refresh
Cookie: access_token=...; refresh_token=...
```

**Logout**
```http
POST /user/logout
```

### Rooms

**Create Room**
```http
POST /room/create-room
Cookie: access_token=...
Content-Type: application/json

{
  "room_name": "general"
}
```

**List Rooms** (paginated + search)
```http
GET /room/get-room?page=1&limit=6&search=gen
```

**Delete Room** (admin only)
```http
DELETE /room/delete-room/42
Cookie: access_token=...
```

---

## WebSocket Protocol

### Connection & Authentication

```
ws://localhost:3001
```

After the WebSocket connection is established, the client **must** send an authentication message as the first frame:

```json
{ "type": "AUTH", "token": "<access_token>" }
```

**Server responses**:
- `{ "type": "AUTH_SUCCESS" }` — authenticated, ready for messages
- `"Access Token Expired"` — token expired, connection closed
- `"Authentication Failed"` — invalid token, connection closed

### Message Types

**Join a room**:
```json
{ "type": "join-room", "roomId": 1 }
```

**Send a chat message**:
```json
{ "type": "chat", "roomId": 1, "message": "Hello, world!" }
```

**Leave a room**:
```json
{ "type": "leave-room", "roomId": 1 }
```

### Server-Initiated Events

**Token expiring warning** (sent 60s before expiry):
```json
{ "type": "TOKEN_EXPIRING", "expiresIn": 60 }
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 24
- **Bun** >= 1.4.2 (package manager)
- **PostgreSQL** >= 15
- **Redis** (with Streams support, >= 5.0)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/relay.git
cd relay

# Install dependencies
bun install
```

### Environment Setup

Create `.env` files in each service that needs one:

**`packages/db/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/relay"
```

**`packages/redis/.env`**
```env
redisUrl="redis://localhost:6379"
```

**`apps/http-server/.env`**
```env
PORT=3000
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
DATABASE_URL="postgresql://user:password@localhost:5432/relay"
redisUrl="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
FRONTEND_PRODUCTION_URL="https://your-domain.com"
```

**`apps/ws-server/.env`**
```env
PORT=3001
JWT_ACCESS_SECRET="your-access-secret"
DATABASE_URL="postgresql://user:password@localhost:5432/relay"
redisUrl="redis://localhost:6379"
FRONTEND_URL="http://localhost:5173"
FRONTEND_PRODUCTION_URL="https://your-domain.com"
```

**`apps/chat-worker/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/relay"
redisUrl="redis://localhost:6379"
```

**`apps/web/.env.local`**
```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3001"
```

### Database Setup

```bash
# Generate Prisma client
bun run --filter @repo/db db:generate

# Run migrations
bun run --filter @repo/db db:migrate

# (Optional) Seed the database
bun run seed
```

### Run in Development

```bash
# Start all services concurrently (web, http-server, ws-server, chat-worker)
bun run dev
```

This uses Turborepo to spin up all four apps in parallel with hot-reload.

| Service | Default Port |
|---|---|
| `web` | `5173` |
| `http-server` | `3000` |
| `ws-server` | `3001` |
| `chat-worker` | — (background process) |

### Build for Production

```bash
bun run build
```

### Start Production

```bash
bun run start
```

---

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `PORT` | http-server, ws-server | Server port |
| `DATABASE_URL` | db, http-server, ws-server, chat-worker | PostgreSQL connection string |
| `redisUrl` | redis, http-server, ws-server, chat-worker | Redis connection string |
| `JWT_ACCESS_SECRET` | http-server, ws-server | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | http-server | Secret for signing refresh tokens |
| `FRONTEND_URL` | http-server, ws-server | Frontend origin for CORS |
| `FRONTEND_PRODUCTION_URL` | http-server, ws-server | Production frontend origin for CORS |
| `NODE_ENV` | all | Environment mode |
| `VITE_API_URL` | web | HTTP API base URL |
| `VITE_WS_URL` | web | WebSocket server URL |

---

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start all services in development mode |
| `bun run build` | Build all packages and apps |
| `bun run start` | Start all built services |
| `bun run lint` | Lint all packages |
| `bun run check-types` | Type-check all packages |
| `bun run db:init` | Initialize the database |
| `bun run db:update` | Update database schema |
| `bun run seed` | Seed the database with sample data |

---

<p align="center">
  Built with ❤️ using TypeScript, Redis, and PostgreSQL
</p>
