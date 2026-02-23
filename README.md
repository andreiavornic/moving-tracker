# Moving Tracker

A real-time GPS location tracking system with background processing and analytics. Built as a NestJS monorepo with an API service and a background worker that processes location data, calculates distances, detects movement, and provides daily statistics and trip segmentation.

## Tech Stack

- **Runtime:** Node.js 20, TypeScript 5
- **Framework:** NestJS 10 (monorepo)
- **API:** GraphQL (Apollo Server) + Swagger/OpenAPI
- **Database:** PostgreSQL 16 (via TypeORM)
- **Cache & Queue Backend:** Redis 7 (via ioredis)
- **Job Queue:** BullMQ
- **Infrastructure:** Docker, Docker Compose, GitHub Actions CI/CD
- **Deployment:** AWS EC2

## Project Structure

```
moving-tracker/
├── apps/
│   ├── moving-tracker/              # API application
│   │   ├── src/
│   │   │   ├── main.ts             # Entry point (Express + Swagger + GraphQL)
│   │   │   ├── app.module.ts       # Root module
│   │   │   ├── location/           # Location ingestion (GraphQL mutation)
│   │   │   │   ├── location.resolver.ts
│   │   │   │   ├── location.service.ts
│   │   │   │   ├── location.input.ts
│   │   │   │   └── location.module.ts
│   │   │   ├── stats/              # Statistics queries
│   │   │   │   ├── stats.resolver.ts
│   │   │   │   ├── stats.service.ts
│   │   │   │   ├── stats.module.ts
│   │   │   │   └── dto/
│   │   │   │       ├── daily-stats.type.ts
│   │   │   │       └── trip.type.ts
│   │   │   ├── health/             # Health check endpoints
│   │   │   └── metrics/            # Metrics module
│   │   └── test/                   # E2E tests
│   │
│   └── worker/                     # Background job processor
│       ├── src/
│       │   ├── main.ts             # Worker entry point
│       │   ├── worker.module.ts
│       │   └── location-processor/ # Processes queued location jobs
│       └── test/
│
├── libs/
│   ├── common/                     # Shared code
│   │   └── src/
│   │       ├── constants/          # Queue names, thresholds
│   │       ├── enums/              # TransportType (CAR, WALK)
│   │       └── utils/              # haversineDistance(), isMoving()
│   ├── database/                   # TypeORM config & entities
│   │   └── src/
│   │       ├── database.module.ts
│   │       └── entities/
│   │           └── location.entity.ts
│   ├── queue/                      # BullMQ configuration
│   └── redis/                      # Redis service wrapper
│
├── .github/
│   └── workflows/workflow.yml      # CI/CD pipeline
├── Dockerfile                      # Multi-stage build (api + worker)
├── docker-compose.yml              # Local development
├── docker-compose.prod.yml         # Production deployment
├── nest-cli.json                   # NestJS monorepo config
├── .env                            # Local environment variables
├── .env.docker                     # Docker environment variables
├── package.json
└── tsconfig.json
```

## Data Flow

```
Client (mobile/web)
  │
  ▼
GraphQL Mutation: addLocation
  │
  ▼ (API service)
LocationService.sendLocation()
  ├── Insert into PostgreSQL (locations table)
  └── Enqueue job to BullMQ
        │
        ▼ (Worker service)
        LocationProcessorService
        ├── Calculate isMoving (speed > 1 km/h)
        ├── Calculate distanceFromPrev (Haversine formula)
        ├── Update location record (processed = true)
        └── Invalidate Redis cache
              │
              ▼
Stats Queries (getDailyStats / getTrips)
  ├── Check Redis cache
  ├── Query PostgreSQL on cache miss
  ├── Cache result (TTL: 300s)
  └── Return to client
```

## GraphQL API

### Mutation: `addLocation`

Submit a GPS location point.

```graphql
mutation {
  addLocation(input: {
    userId: "user-123"
    latitude: 47.0105
    longitude: 28.8638
    speed: 45.2
    timestamp: "2025-01-15T10:30:00.000Z"
    transportType: CAR
    accuracy: 10.0  # optional
  })
}
```

### Query: `getDailyStats`

Get daily mobility statistics for a user.

```graphql
query {
  getDailyStats(userId: "user-123", date: "2025-01-15") {
    totalDistanceKm
    averageSpeed
    movingTimeMinutes
    stoppedTimeMinutes
    totalEvents
  }
}
```

### Query: `getTrips`

Get trip segments for a user on a specific date.

```graphql
query {
  getTrips(userId: "user-123", date: "2025-01-15") {
    startTime
    endTime
    distanceKm
    avgSpeed
  }
}
```

### REST Endpoints

| Endpoint       | Description                      |
|----------------|----------------------------------|
| `GET /health`  | Health check (DB + Redis status) |
| `GET /api/docs`| Swagger UI documentation         |
| `GET /graphql` | GraphQL Playground               |

## Environment Variables

| Variable             | Description                  | Default                |
|----------------------|------------------------------|------------------------|
| `DB_HOST`            | PostgreSQL host              | `localhost`            |
| `DB_PORT`            | PostgreSQL port              | `5432`                 |
| `DB_USERNAME`        | PostgreSQL username          | `movingtracker`        |
| `DB_PASSWORD`        | PostgreSQL password          | `movingtracker_secret` |
| `DB_DATABASE`        | PostgreSQL database name     | `movingtracker`        |
| `REDIS_HOST`         | Redis host                   | `localhost`            |
| `REDIS_PORT`         | Redis port                   | `6379`                 |
| `API_PORT`           | API server port              | `3000`                 |
| `WORKER_CONCURRENCY` | Number of concurrent workers | `5`                    |
| `STATS_CACHE_TTL`    | Stats cache TTL in seconds   | `300`                  |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd moving-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start PostgreSQL and Redis with Docker**

   ```bash
   docker compose up postgres redis -d
   ```

   This starts:
   - PostgreSQL on port `5433` (mapped to container port `5432`)
   - Redis on port `6379`

4. **Start the API in watch mode**

   ```bash
   npm run start:dev
   ```

   The API will be available at:
   - GraphQL Playground: http://localhost:3000/graphql
   - Swagger UI: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/health

5. **Start the Worker** (in a separate terminal)

   ```bash
   npx nest start worker --watch
   ```

### Run Everything with Docker Compose

To start all services (PostgreSQL, Redis, API, Worker, Adminer) at once:

```bash
docker compose up --build
```

Services:
- **API:** http://localhost:3000
- **Adminer (DB UI):** http://localhost:8080 (server: `postgres`, user: `movingtracker`, password: `movingtracker_secret`)

## Available Scripts

| Command               | Description                         |
|-----------------------|-------------------------------------|
| `npm run build`       | Compile TypeScript to `dist/`       |
| `npm run start`       | Start the API                       |
| `npm run start:dev`   | Start the API in watch mode         |
| `npm run start:debug` | Start the API in debug + watch mode |
| `npm run start:prod`  | Start compiled API from `dist/`     |
| `npm run lint`        | Run ESLint with auto-fix            |
| `npm run format`      | Run Prettier on all source files    |
| `npm test`            | Run unit tests                      |
| `npm run test:watch`  | Run tests in watch mode             |
| `npm run test:cov`    | Run tests with coverage report      |
| `npm run test:e2e`    | Run end-to-end tests                |

## Docker Build

The project uses a multi-stage Dockerfile that produces two separate images:

| Stage    | Target   | Runs                                    |
|----------|----------|-----------------------------------------|
| `build`  | -        | Installs deps & compiles both apps      |
| `api`    | `api`    | `node dist/apps/moving-tracker/main.js` |
| `worker` | `worker` | `node dist/apps/worker/main.js`         |

Build individually:

```bash
docker build --target api -t moving-tracker-api .
docker build --target worker -t moving-tracker-worker .
```

## Production Deployment

### Docker Compose (Production)

The `docker-compose.prod.yml` file is designed for production use on a server:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Differences from the development compose file:
- No port exposure for PostgreSQL or Redis (internal only)
- No Adminer service
- `restart: always` on all services
- Environment variables set inline (supports `DB_PASSWORD` override via shell env)

### CI/CD Pipeline (GitHub Actions)

The project includes an automated deployment pipeline in `.github/workflows/workflow.yml`.

**Trigger:** Push to `main` branch.

**Pipeline stages:**

1. **Test** - Runs `npm ci` and `npm test` on Ubuntu with Node.js 20
2. **Deploy** (requires tests to pass):
   - Copies the entire project to the EC2 instance via SCP
   - Installs Docker & Docker Compose on EC2 if not already present
   - Runs `docker compose -f docker-compose.prod.yml up --build -d`
   - Prunes old Docker images
   - Runs a health check against `http://localhost:3000/health`

**Required GitHub Secrets:**

| Secret        | Description                        |
|---------------|------------------------------------|
| `EC2_HOST`    | EC2 instance public IP or hostname |
| `EC2_USER`    | SSH username (e.g., `ec2-user`)    |
| `EC2_SSH_KEY` | Private SSH key for EC2 access     |

### Manual Server Deployment

To deploy manually on any Linux server:

1. **Install Docker and Docker Compose** on the server

2. **Copy the project** to the server:

   ```bash
   scp -r . user@server:/home/user/movingtracker
   ```

3. **SSH into the server** and start services:

   ```bash
   ssh user@server
   cd /home/user/movingtracker
   docker compose -f docker-compose.prod.yml up --build -d
   ```

4. **Verify deployment:**

   ```bash
   curl http://localhost:3000/health
   ```

5. **(Optional) Override the database password:**

   ```bash
   DB_PASSWORD=my_secure_password docker compose -f docker-compose.prod.yml up --build -d
   ```

## Database Schema

The `locations` table is auto-created by TypeORM on startup:

| Column               | Type             | Description                       |
|----------------------|------------------|-----------------------------------|
| `id`                 | UUID (PK)        | Auto-generated                    |
| `user_id`            | VARCHAR          | User identifier                   |
| `latitude`           | DOUBLE PRECISION | GPS latitude                      |
| `longitude`          | DOUBLE PRECISION | GPS longitude                     |
| `speed`              | DOUBLE PRECISION | Speed in km/h                     |
| `timestamp`          | TIMESTAMPTZ      | Location timestamp                |
| `date`               | DATE             | Extracted date (for indexing)     |
| `transport_type`     | ENUM (CAR, WALK) | Transport mode                    |
| `accuracy`           | DOUBLE PRECISION | GPS accuracy (nullable)           |
| `is_moving`          | BOOLEAN          | Set by worker (speed > 1 km/h)   |
| `distance_from_prev` | DOUBLE PRECISION | Distance from previous point (km) |
| `processed`          | BOOLEAN          | Whether the worker processed it   |
| `created_at`         | TIMESTAMPTZ      | Record creation time              |

**Indexes:**
- `UNIQUE (user_id, timestamp)` - Prevents duplicate entries
- `INDEX (user_id, date)` - Optimizes daily queries
