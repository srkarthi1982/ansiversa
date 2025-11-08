# api.ansiversa (Phase 1)

Production-ready REST API for Ansiversa (Quiz Institute module) using **Node.js + TypeScript + Hono**.

## ✨ Features
- Hono router (fast, tiny) with TypeScript
- Secure headers, CORS, and simple IP rate limiting
- JWT auth (register/login) via `jose` + `@hono/jwt`
- Zod validation middleware
- Turso / libSQL via `@libsql/client`
- Modular structure: routes → controllers → services → db
- Migrations & seed scripts
- Dockerfile

## 🗂️ Structure
```
src/
  app.ts
  server.ts
  middleware/
  routes/
  controllers/
  services/
  schemas/
  db/
  utils/
```

## 🚀 Quick Start

```bash
pnpm i   # or npm i / yarn
cp .env.example .env
pnpm migrate
pnpm seed
pnpm dev
```

Server: http://localhost:8787

## 🔐 Security
- Secure headers via custom middleware
- CORS allowed from `CORS_ORIGIN`
- Simple IP rate limiting (60 rpm default)
- JWT Bearer tokens for protected routes

## 🧪 Health
`GET /health` → { status: "ok", env: NODE_ENV }

## 📚 Quiz Endpoints (Phase 1)
- `GET /platforms`
- `GET /platforms/:id`
- `POST /platforms`
- `PUT /platforms/:id`
- `DELETE /platforms/:id`

- `GET /subjects?platformId=...`
- `POST /subjects`

- `GET /topics?subjectId=...`
- `POST /topics`

- `GET /questions/random?topicId=...&limit=10`
- `POST /questions` (bulk supported)

Protected write operations require `Authorization: Bearer <token>`.

## 👤 Auth
- `POST /auth/register` { email, password }
- `POST /auth/login` { email, password } → { token }
