<p align="center">
  <img src="https://img.shields.io/badge/Relay-Chat-7C3AED?style=for-the-badge&logo=wechat&logoColor=white" alt="Relay" />
</p>

<h1 align="center">⚡ Relay</h1>
<p align="center">
  <b>Real-time chat platform built with WebSockets, Redis Streams & Turborepo</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Bun-1.4-F9F1E1?style=flat-square&logo=bun&logoColor=black" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-Streams-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Turborepo-2-EF4444?style=flat-square&logo=turborepo&logoColor=white" />
</p>

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│   Client    │──HTTP──▶  HTTP Server │──────▶│  PostgreSQL   │
│  (Browser)  │       │  (Express 5) │       │  (Prisma 7)   │
│             │──WS───▶  WS Server   │──────▶│               │
└─────────────┘       │  (ws lib)    │       └───────────────┘
                      └──────┬───────┘
                             │ XADD
                      ┌──────▼───────┐
                      │    Redis     │
                      │   Streams    │
                      └──────┬───────┘
                             │ XREADGROUP
                      ┌──────▼───────┐
                      │ Chat Worker  │──────▶ PostgreSQL
                      │ (Consumer)   │        (batch persist)
                      └──────────────┘
```

**Flow:** Client authenticates via HTTP → connects over WebSocket → sends chat messages → WS server pushes events to **Redis Streams** → **Chat Worker** (consumer group) reads events and batch-persists them to PostgreSQL. This decouples real-time delivery from DB writes for high throughput.

---

## Monorepo Structure

```
relay/
├── apps/
│   ├── http-server      # REST API — auth, rooms (Express 5)
│   ├── ws-server        # WebSocket server — real-time messaging
│   ├── chat-worker      # Redis Streams consumer — persists chats to DB
│   └── web              # Frontend (WIP)
│
├── packages/
│   ├── db               # Prisma 7 client + schema + migrations
│   ├── redis            # Shared ioredis singleton
│   ├── api_contracts    # Zod schemas (shared validation)
│   ├── codes            # HTTP status & error codes
│   ├── eslint-config    # Shared ESLint config
│   ├── typescript-config# Shared tsconfig
│   └── ui               # Shared UI components (WIP)
│
├── turbo.json
└── package.json
```

---

## Database Schema

```prisma
model User {
  id, email (unique), name, password
  → has many Chats, Rooms (member), Rooms (admin)
}

model Room {
  id, room_name (unique), adminId
  → belongs to admin User, has many members, has many Chats
}

model Chat {
  id, eventId (unique — Redis stream ID), message, userId, roomId
  → belongs to User, belongs to Room
}
```

---

## API Reference

### HTTP Server (`apps/http-server`) — default port `3000`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/user/signup` | ✗ | Register a new user |
| `POST` | `/user/signin` | ✗ | Login, returns JWT tokens |
| `POST` | `/user/refresh` | ✓ | Refresh access token |
| `POST` | `/room/create-room` | ✓ | Create a chat room |
| `GET` | `/room/get-room` | ✗ | List all rooms |
| `DELETE` | `/room/delete-room/:id` | ✓ | Delete a room |
| `GET` | `/health` | ✗ | Health check |

### WebSocket Server (`apps/ws-server`) — default port `8080`

Connect with JWT token in cookie. Messages are JSON:

```jsonc
// Join a room
{ "type": "join-room", "roomId": 1 }

// Send a message
{ "type": "chat", "roomId": 1, "message": "Hello!" }

// Leave a room
{ "type": "leave-room", "roomId": 1 }
```

### Chat Worker (`apps/chat-worker`)

Background process — no external API. Consumes from Redis stream `chat-events` using consumer group `chat-workers`, persists to PostgreSQL, and acknowledges processed messages.

---

## Quick Start

### Prerequisites

- **Bun** ≥ 1.4
- **Node.js** ≥ 24
- **PostgreSQL** running locally
- **Redis** running locally

### Setup

```bash
# 1. Clone & install
git clone <repo-url> && cd relay
bun install

# 2. Configure environment
#    Copy and edit .env in each app:
#    - apps/http-server/.env
#    - apps/ws-server/.env
#    - apps/chat-worker/.env
#    - packages/db/.env

# 3. Setup database
cd packages/db
bunx prisma migrate dev
bunx prisma generate
cd ../..

# 4. Run everything
bun run dev          # starts all apps via Turborepo
```

### Environment Variables

| Variable | Used By | Example |
|----------|---------|---------|
| `PORT` | http-server, ws-server | `3000`, `8080` |
| `DATABASE_URL` | db package | `postgresql://user:pass@localhost:5432/relay` |
| `redisUrl` | redis package | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | http-server, ws-server | `your-secret` |
| `JWT_REFRESH_SECRET` | http-server | `your-secret` |
| `NODE_ENV` | all | `development` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.4 / Node.js 24 |
| Language | TypeScript 7 |
| HTTP Framework | Express 5 |
| WebSockets | `ws` library |
| Database | PostgreSQL + Prisma 7 |
| Message Queue | Redis Streams (ioredis) |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Validation | Zod 4 |
| Monorepo | Turborepo 2 + Bun workspaces |

---

## Scripts

```bash
bun run dev          # Start all apps in dev mode
bun run build        # Build all packages
bun run lint         # Lint everything
bun run format       # Prettier format
bun run check-types  # Type-check all packages
```

---

## License

MIT

