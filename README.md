# Emo Ray Minigame Backend API (`psh-emoray`)

Backend API service for the PlayStation Home minigame **Emo Ray vs. Intergalactic Teddy Bears** (Heavy Water / D2O).

## Features

- **NP Ticket Validation**: Stubbed ticket validation returning player IDs and environment settings (`/D2O/Ticket/validate/*`).
- **Telemetry & Metrics**: Collects game metrics and telemetry data (`/D2O/EmoRay/metrics`).
- **Player Progression & Save States**: Persistent storage with SQLite & Drizzle ORM for:
  - Progression data (story/mission chapters, episode unlocks)
  - Equipped mods & weapons (MiniGun, Cannon, Decal, Engine, etc.)
  - Store progress & ModPoints (upgrades, unlocked furniture, costumes, posters)
  - Scores per episode and chapter
  - Controller configurations (camera inversion, sensitivity)
- **Logging & Observability**: Integrated with LogLayer, Pino, and OpenTelemetry OTLP tracing & logging.
- **Docker & CI/CD**: Containerized with multi-stage Bun Alpine Dockerfile and automated GitHub Container Registry (GHCR) publishing.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **ORM / Database**: [Drizzle ORM](https://orm.drizzle.team) + [SQLite (Bun SQLite)](https://bun.sh/docs/api/sqlite)
- **Logging**: [LogLayer](https://loglayer.dev) + [Pino](https://getpino.io) + [OpenTelemetry](https://opentelemetry.io)

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```

The server will start on port `3000` (or `PORT` env var).

### Docker Deployment

Run with Docker Compose:
```bash
docker compose up -d
```
