const formatEl = document.getElementById('format');
const pitchEl = document.getElementById('pitchType');
const weatherEl = document.getElementById('weather');
const seedEl = document.getElementById('seed');
const btnEl = document.getElementById('simulateBtn');
const resultEl = document.getElementById('result');
const canvas = document.getElementById('trajectory');
const ctx = canvas.getContext('2d');

function drawTelemetry(ballSamples = []) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0b162f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#27406f';
  for (let i = 0; i <= 10; i += 1) {
    const y = (canvas.height / 10) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (!ballSamples.length) return;

  const maxTurn = Math.max(...ballSamples.map((b) => Math.abs(b.turnDegrees)), 1);
  const maxSide = Math.max(...ballSamples.map((b) => Math.abs(b.sideForce)), 1);

  ctx.strokeStyle = '#58f5a5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ballSamples.forEach((ball, idx) => {
    const x = (idx / (ballSamples.length - 1 || 1)) * canvas.width;
    const y = canvas.height - (Math.abs(ball.turnDegrees) / maxTurn) * (canvas.height - 20) - 10;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.strokeStyle = '#4cc2ff';
  ctx.beginPath();
  ballSamples.forEach((ball, idx) => {
    const x = (idx / (ballSamples.length - 1 || 1)) * canvas.width;
    const y = canvas.height - (Math.abs(ball.sideForce) / maxSide) * (canvas.height - 20) - 10;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = '#e8efff';
  ctx.font = '12px sans-serif';
  ctx.fillText('Green = spin turn intensity', 14, 20);
  ctx.fillText('Blue = swing side-force intensity', 14, 38);
}

async function simulate() {
  btnEl.disabled = true;
  btnEl.textContent = 'Simulating...';

  try {
    const payload = {
      format: formatEl.value,
      pitchType: pitchEl.value,
      weather: weatherEl.value,
      seed: Number(seedEl.value || 0),
    };

    const res = await fetch('/api/simulate/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    resultEl.textContent = JSON.stringify(data.summary, null, 2);
    drawTelemetry(data.telemetrySample);
  } catch (error) {
    resultEl.textContent = `Simulation failed: ${error.message}`;
    drawTelemetry([]);
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = 'Simulate Match';
  }
}

btnEl.addEventListener('click', simulate);
simulate();
