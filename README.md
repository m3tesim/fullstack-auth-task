# fullstack-auth-task

A production-minded authentication module: a **NestJS + Mongoose** backend and a
**React + TypeScript + Tailwind** frontend. Users can sign up and sign in;
passwords are hashed with bcrypt and sessions are carried by a JWT.

## Features

### Backend (`server/`)
- NestJS with a clean **Controller → Service** structure.
- Mongoose `User` schema (`name`, unique `email`, hashed `password` that is never
  returned to clients).
- `POST /auth/signup`, `POST /auth/signin`, and a JWT-protected `GET /auth/profile`.
- Passwords hashed with **bcrypt**; signin issues a **JWT** via `@nestjs/jwt`.
- **class-validator** DTOs: name ≥ 3 chars, valid email, password ≥ 8 chars with
  at least one letter, one number and one special character.
- **Passport JWT** strategy guarding protected routes (`@UseGuards(JwtAuthGuard)`).
- **Global exception filter** producing a consistent payload:
  `{ statusCode, message, error, timestamp, path }`.
- Configuration through **@nestjs/config** — no hardcoded secrets.
- Swagger docs at `/docs`.

### Frontend (`client/`)
- Vite + React 19 + TypeScript + Tailwind CSS v4.
- Sign up and sign in forms built with **react-hook-form** + **zodResolver**,
  with inline error messages below each field (rules mirror the backend).
- Central **Axios instance** that sends credentials, attaches the bearer token,
  and redirects to `/login` on `401`.
- Client-side routing with a protected `/dashboard` route.

## Getting started

### Prerequisites
- Node.js 20.19+ (or 22.13+) and npm
- A MongoDB instance (e.g. `docker run -d -p 27017:27017 mongo:7`)

### Backend
```bash
cd server
npm install
cp .env.example .env   # then edit values
npm run start:dev
```

`server/.env` variables:

| Variable         | Description                              |
| ---------------- | ---------------------------------------- |
| `PORT`           | API port (default `3000`)                |
| `CLIENT_ORIGIN`  | Comma-separated allowed CORS origins     |
| `MONGODB_URI`    | MongoDB connection string                |
| `JWT_SECRET`     | Secret used to sign JWTs                  |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`                |

### Frontend
```bash
cd client
npm install
cp .env.example .env.local   # set VITE_API_URL to the backend URL
npm run dev
```

## Testing

### Backend — E2E (Jest + Supertest)
Spins up the full Nest app against an in-memory MongoDB
(`mongodb-memory-server`) with the same global `ValidationPipe` and exception
filter as production. Collections are cleared before every test.

```bash
cd server
npm run test:e2e
```

Covers: successful signup (password hash never returned), `400` for short name /
malformed email / weak password, `409` duplicate email, successful signin
(signed JWT), and `401` for a wrong password.

### Frontend — integration (Vitest + React Testing Library)
Renders the real `SignupForm` (react-hook-form + zodResolver) in jsdom.

```bash
cd client
npm run test
```

Covers: all fields render, inline validation errors on empty submit, password
complexity error on a weak password, and a valid submit clearing errors and
calling the signup action.

## API

| Method | Endpoint        | Auth   | Description                          |
| ------ | --------------- | ------ | ------------------------------------ |
| POST   | `/auth/signup`  | —      | Create a user, returns JWT + user    |
| POST   | `/auth/signin`  | —      | Authenticate, returns JWT + user     |
| GET    | `/auth/profile` | Bearer | Returns the current authenticated user |
