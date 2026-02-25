import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConditions, sampleTeams, simulateMatch } from './simulation/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'cricverse-real-simulator' });
});

app.post('/api/simulate/match', (req, res) => {
  const {
    format = 't20',
    teamA = sampleTeams.teamA,
    teamB = sampleTeams.teamB,
    pitchType = 'balanced',
    weather = 'clear',
    airDensity = 1.2,
    wind = 0,
    seed,
  } = req.body || {};

  const conditions = createConditions({ pitchType, weather, airDensity, wind });
  const result = simulateMatch({ format, teamA, teamB, conditions, seed });

  if (format === 'test') {
    return res.json({
      summary: {
        format: result.format,
        winner: result.winner,
        marginRuns: result.marginRuns,
        innings: result.innings.map((i) => ({
          team: i.team,
          runs: i.runs,
          wickets: i.wickets,
          ballsBowled: i.ballsBowled,
        })),
      },
      telemetrySample: result.innings[0].balls.slice(0, 24).map((b) => b.telemetry),
    });
  }

  return res.json({
    summary: {
      format: result.format,
      winner: result.winner,
      firstInnings: {
        team: result.firstInnings.team,
        runs: result.firstInnings.runs,
        wickets: result.firstInnings.wickets,
        ballsBowled: result.firstInnings.ballsBowled,
      },
      secondInnings: {
        team: result.secondInnings.team,
        runs: result.secondInnings.runs,
        wickets: result.secondInnings.wickets,
        ballsBowled: result.secondInnings.ballsBowled,
      },
    },
    telemetrySample: result.firstInnings.balls.slice(0, 24).map((b) => b.telemetry),
  });
});

app.get(/.*/ , (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏏 CricVerse ready at http://localhost:${PORT}`);
});
