# Real 3D Cricket Game - Master Plan (Online + Offline)

## Vision
Goal: **Real human-like cricket experience** with high-end physics, realistic player movement, strong AI, and smooth online multiplayer.

Target quality:
- Better realism than typical mobile cricket games
- Fast response controls
- TV-style presentation + immersive stadium feeling
- Competitive + casual modes both

---

## Core Game Modes

### Match Types
- T20
- ODI
- Test
- IPL League mode
- World Cup mode

### Play Styles
- Offline Quick Match
- Offline Tournament
- Career/Season (future)
- Online Ranked
- Online Friendly
- Private Room Match

---

## Real Feel Pillars

1. **Physics Authenticity**
   - Seam, swing, spin, bounce, bat collision
2. **Human-like Animation**
   - Motion-capture-inspired transitions and timing
3. **Smart Cricket AI**
   - Context-based captaincy, fielding, and shot choices
4. **Broadcast Presentation**
   - Commentary, crowd, replay, scoreboard analytics
5. **Network Quality**
   - Stable multiplayer + anti-cheat + sync accuracy

---

## Engine Architecture (High Level)

## Client (Game)
- Rendering pipeline (stadium, players, crowd)
- Input + shot timing
- Local simulation + prediction
- Animation state machine
- Audio engine triggers
- UI: scoreboard, overlays, replays

## Server (Online)
- Authoritative match state
- Real-time socket communication
- Matchmaking + lobbies
- Anti-cheat validation
- Player profile + progression

## Data Layer
- Match stats
- Tournaments and standings
- Player progression
- Cloud save sync

---

## Physics System Design

### Ball Model
- Position, velocity, spin vector, seam orientation
- Air drag + lift calculation
- Pitch interaction by surface type

### Key Mechanics
- **Swing**: affected by speed, seam angle, atmosphere, release quality
- **Spin**: pre-bounce drift + post-bounce turn
- **Bounce**: pitch hardness + moisture + crack map
- **Bat Impact**: sweet spot, bat angle, timing window, shot intent

### Example Formula Set (game tuned)
- Side force (swing-like):
  - `sideForce = airDensity * seamFactor * velocity^2 * releaseQuality`
- Vertical bounce response:
  - `velocityY = velocityY * pitchBounceFactor - energyLoss`
- Spin influence after bounce:
  - `newDirection += spinAxis * surfaceGrip * angularVelocity`

### Advanced Layers
- Different pitch presets: green, dry, dusty, flat
- Ball wear over overs
- Reverse swing at old ball stages
- Edge and inside-edge probability based on timing error

---

## Animation System

### Animation Buckets
- Bowler run-up and gather
- Bowling release families (pace, off-spin, leg-spin)
- Batting front-foot/back-foot sets
- Defensive, lofted, sweep, reverse-sweep, ramp
- Wicket-keeper collect/stump
- Fielding pickup, throw, dive, jump, relay

### Realism Strategy
- Motion-capture base + procedural blending
- Foot planting and root motion correction
- Context-aware transition (late cut vs cover drive body mechanics)
- Per-player style presets (aggressive, classical, unorthodox)

---

## AI System

### Batting AI
- Shot map by field settings
- Risk model by match situation
- Strike rotation priority in middle overs
- Boundary intent in death overs

### Bowling AI
- Plan by batter weakness
- Over-wise setup (dot pressure, trap field)
- Yorkers/slower balls usage in death

### Fielding AI
- Dynamic fielding positions by bowler line-length
- Catch judgement + run-out decisions
- Relay throw pathing

### Captaincy AI
- Bowling change logic
- Tactical field shifts ball-by-ball

---

## Tournament System

### Supported Structures
- T20 leagues
- IPL points table
- World Cup group + knockout bracket
- Bilateral series
- Test championship style points (future)

### Core Features
- Fixtures generation
- Tie-break logic (NRR, head-to-head)
- Injury/fatigue toggles (optional)
- Auto sim for non-played matches

---

## Online Multiplayer

### Networking Stack
Recommended backend:
- Node.js + WebSocket (or Socket.io)
- Redis for match session state
- PostgreSQL for persistent data

Optional game-engine stack:
- Unity + Photon/Mirror equivalent architecture if engine migration considered

### Netcode Rules
- Server authoritative for ball and outcome
- Client prediction for batting responsiveness
- Reconciliation on server snapshots
- Deterministic event timeline

### Anti-cheat
- Input signature validation
- Impossible reaction-time checks
- Tamper detection for shot power modifiers
- Match integrity audit logs

---

## Stadium Realism

### Visual Layer
- HDR skybox
- Day/Night cycle
- Floodlight shadow tuning
- Weather variants: clear/cloudy/rain interruption
- Crowd LOD (performance-friendly)

### Audio Layer
- Crowd loops by pressure moment
- Stadium chants per team
- Edge/catch/appeal reactive SFX

---

## Commentary + Broadcast

### Commentary Engine
- Event-driven trigger system
- Clip categories:
  - Ball-by-ball
  - Milestone
  - Tactical analysis
  - Hype moments
- Multi-language support roadmap

### Broadcast Package
- Replay camera rails
- Wagon wheel, pitch map, speed meter
- Partnership and required run-rate widgets
- Over summary cards

---

## Scoreboard and Analytics

### Live Widgets
- Overs and run rate
- Required rate
- Partnership
- Batter and bowler cards
- Worm graph (future)

### Deep Stats
- Control percentage
- Dot ball pressure
- Scoring zones
- Match impact index

---

## Development Roadmap (Single Developer Friendly)

## Phase 1 (MVP - 8 to 12 weeks)
- Offline batting-only gameplay
- 1 stadium, 2 teams
- Basic pace + spin bowling machine
- Basic scoreboard
- Local match save

Deliverable: fun playable batting core with good feel.

## Phase 2 (Core Cricket - 12 to 20 weeks)
- Full bowling + fielding AI
- Match formats: T20 + ODI
- Tournament logic
- Improved animations + replays

Deliverable: full offline cricket product.

## Phase 3 (Online - 10 to 16 weeks)
- 1v1 real-time online matches
- Matchmaking + private room
- Desync handling + anti-cheat v1
- Global leaderboard

Deliverable: stable competitive multiplayer.

## Phase 4 (Premium Realism)
- Advanced ball aging/reverse swing
- Dynamic weather impact on pitch
- Commentary pack expansion
- IPL + World Cup polished presentation

Deliverable: flagship “real cricket” identity.

---

## Performance Targets

Mobile focus baseline:
- 60 FPS target on mid-high devices
- 30 FPS fallback profile
- Input latency < 80ms gameplay perception
- Online ping compensation up to 150ms playable

Optimization must-haves:
- Animation LOD
- Crowd instancing
- Physics step tuning
- Asset streaming per stadium zone

---

## Content Pipeline

- Player archetype generator (faces/body types)
- Kit and stadium modular assets
- Seasonal content drops (new tournaments, events)
- Live ops hooks (weekend cups, ranked resets)

---

## Team Expansion Recommendation
If scaling beyond solo dev:
- 1 gameplay physics engineer
- 1 animation/tech art specialist
- 1 backend multiplayer engineer
- 1 UI/UX + broadcast designer
- 1 QA automation support

---

## Practical Reality Check
"Unity se better" quality possible hai, but depends on:
- Engine + tooling maturity
- Animation quality + physics tuning time
- Multiplayer infra stability
- Iteration speed and QA depth

Best strategy:
- Start with **tight, realistic core batting-bowling feel**
- Add modes later
- Polish every release with telemetry feedback

---

## Next 14-Day Action Plan
1. Finalize core physics constants table
2. Create batting timing window prototype
3. Add 1 pace and 1 spin bowler behavior
4. Build minimal scoreboard HUD
5. Record test telemetry (timing success, edge rate)
6. Run 100 simulated overs for balancing
7. Freeze MVP scope

This plan gives a path to build a truly high-realism cricket game in structured steps.
