# CricVerse - Real Match Simulator (Deploy Ready)

This is a deploy-ready Node.js cricket simulation game prototype with:

- Real-time playable web UI (`/`)
- Ball-by-ball simulation engine (swing/spin/bounce heuristics)
- Match formats: T20, ODI, Test
- API endpoint for integration: `POST /api/simulate/match`
- Health endpoint: `GET /health`

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

### Simulate match

`POST /api/simulate/match`

Example payload:

```json
{
  "format": "t20",
  "pitchType": "green",
  "weather": "cloudy",
  "seed": 42
}
```

## Deploy

Any Node host works (Render, Railway, Fly.io, VPS):

- Start command: `npm start`
- Port: use environment variable `PORT`

No build step required.
