<div align="center">

  <h1>🧸 <code>psh-emoray</code> 🚗</h1>

  <p>
    <strong>Backend API service for the PlayStation Home minigame <em>Emo Ray vs. Intergalactic Teddy Bears</em> (Heavy Water / D2O).</strong>
  </p>

  <p>
    <a href="https://github.com/DestinationHome/game-emoray/actions/workflows/docker.yml"><img src="https://img.shields.io/github/actions/workflow/status/DestinationHome/game-emoray/docker.yml?branch=main&style=flat-square&label=build" alt="Build Status"></a>
    <a href="https://github.com/DestinationHome/game-emoray/pkgs/container/game-emoray"><img src="https://img.shields.io/badge/docker-ghcr.io-blue?style=flat-square&logo=docker" alt="Docker Image"></a>
    <a href="#license"><img src="https://img.shields.io/badge/license-GPLv3-blue?style=flat-square" alt="License"></a>
  </p>

</div>

---

## 🌟 Authors

- [@zeph](https://github.com/ZephyrCodesStuff)

## 🌠 Features

- 🎮 **Complete EmoRay Support**: Handles story & mission progression, equipped mod loadouts, vehicle slots, weapon upgrades, scores, controller bindings, and garage store states.
- 💾 **SQLite Persistence**: Powered by [Drizzle ORM](https://orm.drizzle.team) and Bun SQLite with built-in default initialization seeded from the original client scripts.
- 🪵 **Modern Observability**: LogLayer, Pino pretty logging, and OpenTelemetry OTLP tracing / log exporting.

---

## 🌐 Required Domains

Route the following domains through your DNS / reverse proxy to this container (default port `30086`):

| Domain | Protocol | Purpose |
| :--- | :--- | :--- |
| `services.heavyh2o.net` | HTTP | Progression, Equipped, Scores, Config, StoreProgress, and Metrics |
| `secure.heavyh2o.net` | HTTPS | PlayStation Network Ticket Validation (`/D2O/Ticket/validate/*`) |
| `www.services.heavyh2o.net` | HTTP | Client fallback / standard base URL |

> [!TIP]
> Use [**mallory-rs**](https://github.com/ZephyrCodesStuff/mallory-rs) to easily debug and proxy HTTPS/TLS requests from the client.

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

3. **Run unit tests:**
   ```bash
   bun test
   ```

---

### Docker Deployment

Run with Docker Compose:

```bash
docker compose up -d
```

The service will start listening on port `30086`.
