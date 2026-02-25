const DELIVERY_TYPES = {
  INSWINGER: { seamAngle: -0.22, spinRate: 8, speedLoss: 0.01, lengthBias: 0.12 },
  OUTSWINGER: { seamAngle: 0.24, spinRate: 8, speedLoss: 0.01, lengthBias: 0.14 },
  OFF_SPIN: { seamAngle: 0.06, spinRate: 24, speedLoss: 0.02, lengthBias: 0.22 },
  LEG_SPIN: { seamAngle: -0.08, spinRate: 28, speedLoss: 0.02, lengthBias: 0.24 },
  YORKER: { seamAngle: 0.01, spinRate: 5, speedLoss: 0.005, lengthBias: 0.05 },
  BOUNCER: { seamAngle: 0.02, spinRate: 6, speedLoss: 0.005, lengthBias: 0.3 },
  SLOWER: { seamAngle: -0.03, spinRate: 12, speedLoss: 0.035, lengthBias: 0.2 },
};

const SHOT_INTENT = {
  DEFEND: { aggression: 0.12, timingWeight: 0.9 },
  ROTATE: { aggression: 0.3, timingWeight: 0.82 },
  ATTACK: { aggression: 0.72, timingWeight: 0.72 },
  SLOG: { aggression: 0.94, timingWeight: 0.6 },
};

const FORMAT_OVERS = {
  t20: 20,
  odi: 50,
  test: 90,
};

function clamp(num, low, high) {
  return Math.max(low, Math.min(high, num));
}

export function createSeededRng(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createConditions({
  pitchType = 'balanced',
  weather = 'clear',
  airDensity = 1.2,
  wind = 0,
} = {}) {
  const pitchProfiles = {
    green: { bounce: 1.08, friction: 0.44, seamAssist: 1.16 },
    dusty: { bounce: 0.91, friction: 0.66, seamAssist: 0.88 },
    flat: { bounce: 0.97, friction: 0.5, seamAssist: 0.93 },
    hard: { bounce: 1.14, friction: 0.42, seamAssist: 1.04 },
    balanced: { bounce: 1.0, friction: 0.55, seamAssist: 1.0 },
  };

  const weatherProfiles = {
    clear: { swingBoost: 1.0, humidity: 0.45 },
    cloudy: { swingBoost: 1.25, humidity: 0.62 },
    humid: { swingBoost: 1.1, humidity: 0.74 },
    dry: { swingBoost: 0.9, humidity: 0.3 },
    windy: { swingBoost: 1.08, humidity: 0.5 },
  };

  return {
    airDensity,
    wind,
    ...(pitchProfiles[pitchType] || pitchProfiles.balanced),
    ...(weatherProfiles[weather] || weatherProfiles.clear),
  };
}

export function chooseDelivery(overNumber, rng) {
  if (overNumber >= 17) {
    const pool = ['YORKER', 'YORKER', 'SLOWER', 'BOUNCER'];
    return pool[Math.floor(rng() * pool.length)];
  }
  if (overNumber <= 5) {
    const pool = ['OUTSWINGER', 'INSWINGER', 'OUTSWINGER', 'BOUNCER'];
    return pool[Math.floor(rng() * pool.length)];
  }
  const pool = ['OFF_SPIN', 'LEG_SPIN', 'OUTSWINGER', 'SLOWER'];
  return pool[Math.floor(rng() * pool.length)];
}

export function chooseShotIntent({ format, overNumber, chasing, requiredRate, wickets }) {
  if (format === 'test') {
    if (wickets >= 6) return 'DEFEND';
    return overNumber < 30 ? 'ROTATE' : 'ATTACK';
  }

  if (chasing && requiredRate > 11) return 'SLOG';
  if (overNumber >= 17) return 'SLOG';
  if (overNumber <= 5) return 'ROTATE';
  return wickets >= 7 ? 'ROTATE' : 'ATTACK';
}

export function simulateBall({
  bowler,
  batter,
  deliveryType,
  shotIntent,
  conditions,
  over,
  ball,
  rng = Math.random,
}) {
  const delivery = DELIVERY_TYPES[deliveryType] || DELIVERY_TYPES.OUTSWINGER;
  const shot = SHOT_INTENT[shotIntent] || SHOT_INTENT.ROTATE;

  const releaseSpeed = bowler.baseSpeedKph * (0.93 + rng() * 0.14);
  const speedMs = releaseSpeed / 3.6;

  const sideForce =
    conditions.airDensity *
    delivery.seamAngle *
    speedMs *
    speedMs *
    conditions.seamAssist *
    conditions.swingBoost *
    (0.72 + bowler.control * 0.28);

  const bounceFactor = conditions.bounce * (1 - delivery.speedLoss) * (0.91 + rng() * 0.14);

  const turnDegrees =
    delivery.spinRate * conditions.friction * (0.72 + 0.56 * rng()) * (0.5 + bowler.spinSkill * 0.8);

  const lengthDifficulty = Math.abs(delivery.lengthBias - batter.preferredLength) * 1.8;

  const difficulty =
    Math.abs(sideForce) * 0.012 +
    Math.abs(turnDegrees) * 0.028 +
    Math.max(0, (releaseSpeed - 130) * 0.014) +
    lengthDifficulty;

  const reactionWindowMs =
    530 - difficulty * 44 - shot.aggression * 130 + batter.technique * 110 + batter.reflex * 70;

  const reactionError = clamp(Math.max(0, 1 - reactionWindowMs / 520) + rng() * 0.28, 0, 1.8);

  const edgeChance = clamp(0.03 + reactionError * 0.16 + (shot.aggression > 0.7 ? 0.07 : 0.01), 0, 0.85);
  const wicketChance = clamp(
    0.018 + reactionError * 0.1 + (shot.aggression > 0.85 ? 0.06 : 0) + (releaseSpeed > 145 ? 0.013 : 0),
    0,
    0.72,
  );

  const misread = rng() < reactionError * 0.42;
  const edged = rng() < edgeChance;
  const wicket = rng() < wicketChance;

  if (wicket) {
    return {
      over,
      ball,
      outcome: 'W',
      runs: 0,
      commentary: `${deliveryType} at ${releaseSpeed.toFixed(1)} kph, beaten for pace and OUT!`,
      telemetry: { releaseSpeed, sideForce, bounceFactor, turnDegrees, reactionWindowMs },
    };
  }

  let runs;
  if (edged || misread) {
    runs = rng() < 0.7 ? 0 : 1;
  } else {
    const quality =
      batter.power * shot.aggression +
      batter.timing * shot.timingWeight * (1 - reactionError * 0.4) +
      batter.technique * 0.18;

    if (quality > 1.22 && rng() < 0.45) runs = 6;
    else if (quality > 0.98 && rng() < 0.52) runs = 4;
    else if (quality > 0.8) runs = rng() < 0.56 ? 2 : 1;
    else runs = rng() < 0.6 ? 1 : 0;
  }

  return {
    over,
    ball,
    outcome: String(runs),
    runs,
    commentary: `${deliveryType} bowled at ${releaseSpeed.toFixed(1)} kph, ${runs} run(s).`,
    telemetry: { releaseSpeed, sideForce, bounceFactor, turnDegrees, reactionWindowMs },
  };
}

export function simulateInnings({
  format = 't20',
  overs,
  battingTeam,
  bowlingTeam,
  conditions,
  target,
  rng = Math.random,
}) {
  const maxOvers = overs ?? FORMAT_OVERS[format] ?? 20;
  let runs = 0;
  let wickets = 0;
  const balls = [];

  const batter = battingTeam.batter;
  const bowler = bowlingTeam.bowler;

  for (let o = 0; o < maxOvers; o += 1) {
    for (let b = 1; b <= 6; b += 1) {
      const ballsBowledSoFar = o * 6 + b - 1;
      const rr = ballsBowledSoFar === 0 ? 0 : (runs * 6) / ballsBowledSoFar;
      const remainingBalls = maxOvers * 6 - ballsBowledSoFar;
      const requiredRate = target ? ((target - runs) * 6) / Math.max(1, remainingBalls) : 0;

      const deliveryType = chooseDelivery(o, rng);
      const shotIntent = chooseShotIntent({
        format,
        overNumber: o,
        chasing: Boolean(target),
        requiredRate,
        wickets,
      });

      const event = simulateBall({
        bowler,
        batter,
        deliveryType,
        shotIntent,
        conditions,
        over: o,
        ball: b,
        rng,
      });

      balls.push({ ...event, runRate: rr, requiredRate });
      runs += event.runs;
      if (event.outcome === 'W') wickets += 1;

      if (wickets >= 10) {
        return { runs, wickets, ballsBowled: o * 6 + b, balls, allOut: true };
      }
      if (target && runs >= target) {
        return { runs, wickets, ballsBowled: o * 6 + b, balls, chased: true };
      }
    }
  }

  return { runs, wickets, ballsBowled: maxOvers * 6, balls };
}

export function simulateLimitedOversMatch({ format = 't20', teamA, teamB, conditions, rng = Math.random }) {
  const maxOvers = FORMAT_OVERS[format] ?? 20;

  const first = simulateInnings({
    format,
    overs: maxOvers,
    battingTeam: teamA,
    bowlingTeam: teamB,
    conditions,
    rng,
  });

  const second = simulateInnings({
    format,
    overs: maxOvers,
    battingTeam: teamB,
    bowlingTeam: teamA,
    conditions,
    target: first.runs + 1,
    rng,
  });

  let winner;
  if (second.runs > first.runs) winner = teamB.name;
  else if (second.runs < first.runs) winner = teamA.name;
  else winner = 'Tie';

  return {
    format,
    conditions,
    firstInnings: { team: teamA.name, ...first },
    secondInnings: { team: teamB.name, ...second },
    winner,
  };
}

export function simulateTestMatch({ teamA, teamB, conditions, rng = Math.random }) {
  const innings = [];
  const order = [teamA, teamB, teamA, teamB];

  for (let i = 0; i < 4; i += 1) {
    const batting = order[i];
    const bowling = batting.name === teamA.name ? teamB : teamA;
    const target = i === 3 ? Math.max(1, innings[0].runs + innings[2].runs - (innings[1].runs || 0) + 1) : undefined;

    const result = simulateInnings({
      format: 'test',
      overs: 90,
      battingTeam: batting,
      bowlingTeam: bowling,
      conditions,
      target,
      rng,
    });

    innings.push({ team: batting.name, ...result });
    if (target && result.runs >= target) break;
  }

  const teamATotal = innings.filter((i) => i.team === teamA.name).reduce((sum, i) => sum + i.runs, 0);
  const teamBTotal = innings.filter((i) => i.team === teamB.name).reduce((sum, i) => sum + i.runs, 0);

  const winner = teamATotal === teamBTotal ? 'Draw' : teamATotal > teamBTotal ? teamA.name : teamB.name;
  return { format: 'test', conditions, innings, winner, marginRuns: Math.abs(teamATotal - teamBTotal) };
}

export function simulateMatch({ format = 't20', teamA, teamB, conditions, seed }) {
  const rng = seed ? createSeededRng(Number(seed)) : Math.random;
  if (format === 'test') return simulateTestMatch({ teamA, teamB, conditions, rng });
  if (format === 'odi') return simulateLimitedOversMatch({ format: 'odi', teamA, teamB, conditions, rng });
  return simulateLimitedOversMatch({ format: 't20', teamA, teamB, conditions, rng });
}

export const sampleTeams = {
  teamA: {
    name: 'Mumbai Meteors',
    batter: { technique: 0.76, timing: 0.82, power: 0.78, reflex: 0.75, preferredLength: 0.18 },
    bowler: { baseSpeedKph: 141, control: 0.74, spinSkill: 0.3 },
  },
  teamB: {
    name: 'Delhi Dynamos',
    batter: { technique: 0.72, timing: 0.77, power: 0.84, reflex: 0.68, preferredLength: 0.22 },
    bowler: { baseSpeedKph: 137, control: 0.8, spinSkill: 0.42 },
  },
};
