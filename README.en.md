# 🍔 My Menu

[🇹🇷 Türkçe](README.md) | 🇬🇧 English

A QR-based table ordering app. Customers build their order from the menu and enter their table number. The app generates a **QR code** for the order; a waiter scans it and confirms the order. Think of a self-service kiosk, brought to the table.

> 🚧 **Work in progress.** The backend API is currently under development. The web interface and mobile app will come in later phases.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API](#api)
- [Tests and Code Quality](#tests-and-code-quality)
- [Project Status](#project-status)
- [Documentation](#documentation)
- [License](#license)

## Tech Stack

| Layer            | Technology                                                 |
| ---------------- | ---------------------------------------------------------- |
| Runtime          | Node.js (ESM, JavaScript)                                  |
| Backend          | [Fastify 5](https://fastify.dev/) + JSON Schema validation |
| Database         | PostgreSQL 17                                              |
| ORM              | Prisma 7 (`@prisma/adapter-pg` driver adapter)             |
| Infrastructure   | Docker Compose (PostgreSQL, Adminer, API)                  |
| Testing          | Node.js built-in test runner (`node --test`)               |
| Code quality     | ESLint + `eslint-plugin-boundaries`, Prettier              |
| Web (planned)    | React + Vite                                               |
| Mobile (planned) | React Native                                               |

## Architecture

The project is designed as a **modular monolith**: it runs as a single application but is split internally into isolated modules. Each module has its own layers:

```
apps/api/src/
├── modules/
│   ├── menu/            # Categories and products
│   ├── table/           # Tables and table validation
│   ├── ordering/        # Orders (Phase 5)
│   └── identity/        # Staff login and roles (Phase 10)
│       ├── domain/          # Entities and business rules, no framework/ORM knowledge
│       ├── application/     # Use cases + repository contracts
│       ├── infrastructure/  # Prisma and in-memory repositories
│       ├── presentation/    # Fastify routes and schemas
│       └── index.js         # The module's only public entry point (public API)
├── shared/              # config, database, errors, http, health
├── container.js         # Dependency Injection (composition root)
├── app.js               # Builds the Fastify application
└── server.js            # Starts the server
```

Core rules:

- A module may not import from another module's internal folders; it can only go through that module's `index.js`. This is enforced automatically by ESLint (`eslint-plugin-boundaries`).
- Dependencies point inward: `presentation → application → domain`.
- Prisma is only used inside `infrastructure/` and `shared/database/`. Use cases don't know about the ORM, so tests can run against in-memory repositories.

The monorepo is managed with npm workspaces:

```
apps/api/          # Backend API
packages/shared/   # Code shared between apps
docs/              # ADRs and domain documents
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (a recent version with `--env-file` and `--watch` support)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/AEVYEN/QR_Restaurant_Automation_App.git
cd QR_Restaurant_Automation_App
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

In `.env`, change `POSTGRES_PASSWORD` and fill in `DATABASE_URL` with the same credentials:

```env
DATABASE_URL=postgresql://mymenu:YOUR_PASSWORD@localhost:5432/mymenu_dev
```

| Variable               | Description                                 | Default       |
| ---------------------- | ------------------------------------------- | ------------- |
| `DATABASE_URL`         | PostgreSQL connection string (**required**) | —             |
| `PORT`                 | Port the API listens on                     | `3000`        |
| `NODE_ENV`             | `development`, `production` or `test`       | `development` |
| `LOG_LEVEL`            | `fatal` … `trace`                           | `info`        |
| `ORDER_EXPIRY_MINUTES` | How long an unconfirmed order stays valid   | `15`          |

Variables are validated with `env-schema` at startup. If a value is missing or invalid, the app refuses to start.

### 3. Start the database

```bash
docker compose up -d db adminer
```

You can browse the database through Adminer: <http://localhost:8080>

### 4. Generate the Prisma client, create the tables and load sample data

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
cd ../..
```

The seed adds a sample menu (burgers, salads, drinks, desserts) and tables 1–20. Prices are stored in **kuruş** (1/100 of a Turkish lira): `28000` = ₺280.00.

### 5. Run the API

```bash
npm run dev --workspace=@my-menu/api
```

The API listens on the `PORT` from your `.env` file. To check that it works:

```bash
curl http://localhost:3000/health
```

### Alternative: Run everything with Docker

```bash
docker compose up -d --build
```

This starts the database, Adminer and the API together. The containerized API is exposed on port **4000**: <http://localhost:4000/health>. The container does not run migrations, so you need to run step 4 once from your host machine.

## API

All business endpoints are served under the `/api/v1` prefix. `/health` is an infrastructure endpoint, so it is unversioned.

| Method | Path                              | Description                                                                               |
| ------ | --------------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/health`                         | Status of the API and its database connection                                             |
| GET    | `/api/v1/menu`                    | Products grouped by active category (sold-out items included, with an `isAvailable` flag) |
| GET    | `/api/v1/tables/:number/validate` | Checks whether a table exists and is active                                               |

### Response format

Every response uses the same envelope structure.

Success:

```json
{ "data": { "number": 5 } }
```

Error:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Kaynak bulunamadı"
  }
}
```

Error codes: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `SERVICE_UNAVAILABLE` (503), `INTERNAL_ERROR` (500). For validation errors, the `details` field shows which field was rejected and why. Error messages are currently in Turkish; clients should rely on `code`, not `message`.

## Tests and Code Quality

```bash
npm test               # Run tests in all workspaces
npm run lint           # ESLint (including module boundary rules)
npm run format:check   # Prettier check
npm run format         # Format with Prettier
```

Unit tests cover use cases and entities without a database, using in-memory repositories.

## Project Status

| Phase | Title                          | Status |
| ----- | ------------------------------ | ------ |
| 0     | Decisions & Project Setup      | ✅     |
| 1     | Domain Modeling                | ✅     |
| 2     | Backend Skeleton               | ✅     |
| 3     | Menu Module                    | ✅     |
| 4     | Table Module                   | 🚧     |
| 5     | Ordering Module                | ⏳     |
| 6     | QR Flow                        | ⏳     |
| 7–9   | Web: Customer, Waiter, Admin   | ⏳     |
| 10    | Authentication & Authorization | ⏳     |
| 11    | Testing & Quality              | ⏳     |
| 12    | Security & Deployment          | ⏳     |
| 13    | Mobile (React Native)          | ⏳     |

## Documentation

The project documents are written in Turkish.

- [docs/adr/](docs/adr/): Architecture Decision Records (database, backend framework, monorepo structure)
- [docs/domain/business-rules.md](docs/domain/business-rules.md): Order business rules
- [docs/domain/order-status-machine.md](docs/domain/order-status-machine.md): Order status state machine

## License

[MIT](LICENSE)
