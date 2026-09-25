# HTTP Status Codes

A simple reference for the HTTP status codes most commonly used in production APIs.

## Status Codes

| Code  | Name                    | Typical Use                               |
| ----- | ----------------------- | ----------------------------------------- |
| `200` | `OK`                    | Successful GET/PATCH/PUT                  |
| `201` | `CREATED`               | Resource successfully created             |
| `204` | `NO_CONTENT`            | Successful DELETE / response with no body |
| `400` | `BAD_REQUEST`           | Invalid request data                      |
| `401` | `UNAUTHORIZED`          | Missing or invalid authentication         |
| `403` | `FORBIDDEN`             | Authenticated but not allowed             |
| `404` | `NOT_FOUND`             | Resource doesn't exist                    |
| `409` | `CONFLICT`              | Duplicate or conflicting resource         |
| `422` | `UNPROCESSABLE_ENTITY`  | Validation failure                        |
| `429` | `TOO_MANY_REQUESTS`     | Rate limit exceeded                       |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected backend error                  |
| `503` | `SERVICE_UNAVAILABLE`   | Service temporarily unavailable           |

## Example

```ts
export const httpStatusCodes = {
  // 2xx — Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 4xx — Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx — Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
```

### Usage

```ts
return res.status(httpStatusCodes.CREATED).json({
  message: "User created successfully",
  user,
});
```

## Categories

* **2xx** — Successful requests
* **4xx** — Client-side errors
* **5xx** — Server-side errors
