# Precious Charms API

Backend API for the Precious Charms e-commerce application. Built with NestJS and MongoDB.

## Features

- **Auth** — `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (JWT)
- **Users** — `GET /users`, `GET /users/:id`
- **Products** — list/filter/paginate, get by id, create/update/delete
- **Cart** — get, add, update quantity, remove (JWT required)
- **Orders** — create from cart, list orders (JWT required)
- **Address** — CRUD for shipping addresses (JWT required)

## Tech Stack

- NestJS 11, MongoDB (Mongoose), Passport JWT, bcrypt, class-validator

## Prerequisites

- Node.js 18+
- MongoDB (local **or** [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster)
- npm

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Create / edit `.env` in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/precious-charms
JWT_SECRET=precious-charms-secret
```

For Atlas, use your connection string (database name after `/` must match Atlas exactly):

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/precious-charms
```

**Atlas Network Access:** add your current IP (or `0.0.0.0/0` for local testing). Without this you get `IP isn't whitelisted` even when `.env` is loaded correctly.

On startup the API logs a masked `MONGODB_URI` and whether `.env` was found — use that to confirm env loading.

3. **Run the API**

```bash
npm run start:dev
```

4. **Seed products** (from the React app `db.json`)

```bash
npm run seed
```

Server: `http://localhost:8080` (or whatever `PORT` is in `.env`)

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register `{ name, email, password }` |
| POST | `/auth/login` | No | Login → `{ accessToken, user }` |
| — | Demo admin | — | `admin123@gmail.com` / `admin123` (seeded on API startup; JWT required for `/users` + product CRUD) |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/products` | No | List (`_page`, `_limit`, `category`, `brand`, `name`, `q`, `_sort`, `_order`) |
| GET | `/products/:id` | No | Product detail |
| POST/PATCH/DELETE | `/products` | Bearer | Admin product CRUD |
| GET/POST/PATCH/DELETE | `/cart` | Bearer | Cart operations |
| GET/POST | `/orders` | Bearer | List / place order |
| GET/POST/PATCH/DELETE | `/address` | Bearer | Addresses |

## Frontend

React app path: `D:\Project\PreciousAndCharms\adaptable-oven-8035`

Set in the React `.env`:

```env
REACT_APP_API_URL=http://localhost:3000
```

Then:

```bash
cd D:\Project\PreciousAndCharms\adaptable-oven-8035
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server (watch) |
| `npm run build` | Build |
| `npm run start:prod` | Run production build |
| `npm run seed` | Seed products into MongoDB |
| `npm test` | Unit tests |

## License

UNLICENSED — private project.
