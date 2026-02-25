# CricVerse - Real Match Simulator (Deploy Ready)

This is a deploy-ready Node.js cricket simulation app with:

- Playable web UI (`/`)
- Ball-by-ball simulation engine (swing/spin/bounce heuristics)
- Match formats: T20, ODI, Test
- API endpoint: `POST /api/simulate/match`
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

## Deploy on Vercel

This repo includes `vercel.json` configured to run `server.js` as a Node serverless function and route all paths through it.

Steps:
1. Import repo in Vercel.
2. Keep framework preset as **Other**.
3. No output directory needed.
4. Deploy.

## Deploy on other Node hosts

Works on Render / Railway / Fly / VPS:

- Start command: `npm start`
- Port: environment variable `PORT`
