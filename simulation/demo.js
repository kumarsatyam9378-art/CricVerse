import { createConditions, sampleTeams, simulateMatch } from './engine.js';

const conditions = createConditions({ pitchType: 'hard', weather: 'cloudy', airDensity: 1.22, wind: 4 });
const result = simulateMatch({
  format: 't20',
  teamA: sampleTeams.teamA,
  teamB: sampleTeams.teamB,
  conditions,
  seed: 42,
});

const summary = {
  format: result.format,
  winner: result.winner,
  firstInnings: `${result.firstInnings.team} ${result.firstInnings.runs}/${result.firstInnings.wickets}`,
  secondInnings: `${result.secondInnings.team} ${result.secondInnings.runs}/${result.secondInnings.wickets}`,
  firstFiveBalls: result.firstInnings.balls.slice(0, 5),
};

console.log(JSON.stringify(summary, null, 2));
