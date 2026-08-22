<div align="center">

  <h1>🌊 <code>psh-heavywater</code> 🕹️</h1>

  <p>
    <strong>Backend API service for Heavy Water / D2O PlayStation Home spaces and minigames.</strong>
  </p>

  <p>
    <a href="https://github.com/DestinationHome/game-heavywater/actions/workflows/lint.yml"><img src="https://img.shields.io/github/actions/workflow/status/DestinationHome/game-heavywater/lint.yml?branch=main&style=flat-square&label=lint%20%26%20tests" alt="Lint & Tests Status"></a>
    <a href="https://github.com/DestinationHome/game-heavywater/actions/workflows/docker.yml"><img src="https://img.shields.io/github/actions/workflow/status/DestinationHome/game-heavywater/docker.yml?branch=main&style=flat-square&label=build" alt="Build Status"></a>
    <a href="https://github.com/DestinationHome/game-heavywater/pkgs/container/game-heavywater"><img src="https://img.shields.io/badge/docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker Image"></a>
    <a href="#license"><img src="https://img.shields.io/badge/license-AGPLv3-blue?style=flat-square" alt="License"></a>
  </p>

</div>

---

## 🌟 Authors

- [@zeph](https://github.com/ZephyrCodesStuff)

## 🚧 Supported Spaces & Games

- [x] **Emo Ray vs. Intergalactic Teddy Bears** (Day One)
  - Story & mission progression
  - Equipped weapon loadouts & mod parts
  - Vehicle upgrades, decals, and store progress
  - Session metrics & score tracking
  - Controller camera & sensitivity configurations
- [x] **RC Rally** (SCEA Destinations GDO & Communicator)
  - Publisher listing and token verification
  - Track lap times & split times
  - Car parts loadouts & quest objectives
  - Global leaderboard rankings
  - User synchronization
- [ ] **Heavy Water Avalon Sub / Casino & Spaces** *(Upcoming)*

## 🌠 Features

- 🎟️ **Sony NP Ticket Parsing**: Binary layout decoding (based on `npticket-rs`) extracting PSN username, account ID, and region.
- 💾 **SQLite Persistence**: Powered by [Drizzle ORM](https://orm.drizzle.team) and Bun SQLite with built-in default initialization.
- 🪵 **Observability**: LogLayer, Pino pretty logging, and OpenTelemetry OTLP tracing / log exporting.

---

## 🌐 Required Domains

Route the following domains through your DNS / reverse proxy to this container (default port `30086`):

| Domain | Protocol | Purpose |
| :--- | :--- | :--- |
| `services.heavyh2o.net` | HTTP | EmoRay progression, equipped, scores, and RC Rally Communicator XML |
| `secure.heavyh2o.net` | HTTPS | PlayStation Network Ticket Validation (`/D2O/Ticket/validate/*`) |
| `destinations.destinationhome.live` | HTTP | RC Rally Destinations GDO endpoints (`/publisher/list`, `/user/game/*`, `/leaderboard/*`) |
| `www.services.heavyh2o.net` | HTTP | Client fallback / standard base URL |

> [!TIP]
> Use [**mallory-rs**](https://github.com/ZephyrCodesStuff/mallory-rs) to easily debug and proxy HTTPS/TLS requests from the PS3 client.

---

## 🧰 Getting Started

### Quick Local Run

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start the development server:**
   ```bash
   bun run dev
   ```

3. **Run unit tests & linting:**
   ```bash
   bun test
   bun run lint
   ```

---

### Docker Deployment

Run with Docker Compose:

```bash
docker compose up -d
```

The service will start listening on port `30086`.
