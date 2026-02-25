# CricVerse Recommended Project Structure

Agar aap **real deploy-ready cricket game** banana chahte ho (offline + online), to ye folder structure follow karo.

## Target Structure

```text
CricVerse/
├── client/
│   └── src/
│       ├── core/                    # game loop, state machine, timings
│       ├── systems/
│       │   ├── physics/             # swing/spin/bounce/bat impact
│       │   ├── animation/           # run-up, shots, fielding blends
│       │   ├── ai/                  # bowling plans, field placement, batting logic
│       │   ├── commentary/          # event triggers + commentary mapping
│       │   ├── audio/               # crowd + SFX + ambient controller
│       │   └── rendering/           # camera, stadium lighting, VFX
│       ├── gameplay/
│       │   ├── batting/
│       │   ├── bowling/
│       │   └── fielding/
│       ├── ui/
│       │   ├── hud/                 # scoreboard, run rate, overs
│       │   ├── menus/               # mode select, tournament setup
│       │   └── components/
│       ├── multiplayer/             # client netcode, prediction, reconciliation
│       ├── utils/
│       └── assets/
│
├── server/
│   └── src/
│       ├── api/
│       │   ├── routes/              # express route maps
│       │   ├── controllers/         # request handlers
│       │   └── middleware/          # auth, rate limit, validation
│       ├── match-engine/            # authoritative match simulation
│       ├── tournaments/             # IPL table, world cup bracket, fixtures
│       ├── multiplayer/             # socket rooms, matchmaking, sync
│       ├── anti-cheat/              # sanity checks, reaction-time validation
│       ├── db/                      # db models/repositories
│       └── services/                # external integrations
│
├── shared/
│   ├── types/                       # common TS/JS types
│   ├── constants/                   # format constants, gameplay limits
│   └── schemas/                     # request/response validation schemas
│
├── simulation/                      # current simulation prototype (keep for tuning)
├── public/                          # current web UI prototype
├── tests/
│   ├── unit/
│   ├── integration/
│   └── simulation/
├── tools/
│   ├── balancing/                   # scripts for tuning physics/AI values
│   └── telemetry/                   # scripts for metrics + analysis
└── docs/
    └── PROJECT_STRUCTURE.md
```

## How to use this now

1. Current prototype remains in `simulation/`, `public/`, `server.js`.
2. New code gradually shift into `client/src` and `server/src` modules.
3. Keep reusable types/schemas in `shared/`.
4. Every feature (physics, AI, multiplayer) should get:
   - system module
   - API/controller integration
   - tests + telemetry script

## Suggested Build Order

1. `systems/physics` + `gameplay/batting`
2. `gameplay/bowling` + `systems/ai`
3. `ui/hud` + tournament APIs
4. multiplayer server + anti-cheat
5. commentary/audio polish

