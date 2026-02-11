import "./style.css";
import * as THREE from "three";

type GameState = "idle" | "delivery" | "betweenBalls" | "inningsBreak" | "matchOver";
type Role = "bat" | "bowl";
type Difficulty = "easy" | "medium" | "hard";
type ShotDirection = "leg" | "straight" | "off";

const q = <T extends Element>(selector: string) => {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
};

const canvas = q<HTMLCanvasElement>("#game-canvas");
const statusEl = q<HTMLElement>("#status");
const inningsEl = q<HTMLElement>("#innings");
const scoreEl = q<HTMLElement>("#score");
const wicketsEl = q<HTMLElement>("#wickets");
const oversEl = q<HTMLElement>("#overs");
const targetEl = q<HTMLElement>("#target");
const modeEl = q<HTMLElement>("#mode");
const lastBallEl = q<HTMLElement>("#last-ball");

const startBtn = q<HTMLButtonElement>("#start-btn");
const nextBallBtn = q<HTMLButtonElement>("#next-ball-btn");
const resetBtn = q<HTMLButtonElement>("#reset-btn");
const roleSelect = q<HTMLSelectElement>("#role-select");
const oversSelect = q<HTMLSelectElement>("#overs-select");
const difficultySelect = q<HTMLSelectElement>("#difficulty-select");
const cameraSlider = q<HTMLInputElement>("#camera-slider");
const soundToggle = q<HTMLInputElement>("#sound-toggle");
const vibeToggle = q<HTMLInputElement>("#vibe-toggle");
const qualityToggle = q<HTMLInputElement>("#quality-toggle");
const shotLeftBtn = q<HTMLButtonElement>("#shot-left");
const shotStraightBtn = q<HTMLButtonElement>("#shot-straight");
const shotRightBtn = q<HTMLButtonElement>("#shot-right");
const bowlBtn = q<HTMLButtonElement>("#bowl-btn");

const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".tab-btn"));
const panels = {
  play: q<HTMLElement>("#panel-play"),
  shop: q<HTMLElement>("#panel-shop"),
  settings: q<HTMLElement>("#panel-settings"),
};

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab as keyof typeof panels;
    tabButtons.forEach((other) => other.classList.remove("active"));
    Object.values(panels).forEach((panel) => panel.classList.remove("active"));
    btn.classList.add("active");
    panels[tab].classList.add("active");
  });
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#7cc3f7");
scene.fog = new THREE.Fog("#7cc3f7", 55, 150);

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
camera.position.set(0, 11, 34);

const ambient = new THREE.AmbientLight("#dbeafe", 0.7);
scene.add(ambient);
const sun = new THREE.DirectionalLight("#fff7ed", 1.25);
sun.position.set(28, 34, 10);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(95, 96),
  new THREE.MeshStandardMaterial({ color: "#1e9c4b" }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const pitch = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 48),
  new THREE.MeshStandardMaterial({ color: "#d8b57b" }),
);
pitch.rotation.x = -Math.PI / 2;
pitch.position.y = 0.02;
scene.add(pitch);

const boundary = new THREE.Mesh(
  new THREE.TorusGeometry(74, 0.55, 12, 160),
  new THREE.MeshStandardMaterial({ color: "#e2e8f0", emissive: "#1e293b", emissiveIntensity: 0.4 }),
);
boundary.rotation.x = Math.PI / 2;
boundary.position.y = 0.2;
scene.add(boundary);

const stands = new THREE.Mesh(
  new THREE.CylinderGeometry(94, 98, 13, 48, 1, true),
  new THREE.MeshStandardMaterial({ color: "#334155", side: THREE.DoubleSide }),
);
stands.position.y = 6;
scene.add(stands);

const crowdContainer = new THREE.Group();
const crowdMembers: THREE.Mesh[] = [];
const addCrowd = (count: number) => {
  crowdContainer.clear();
  crowdMembers.length = 0;
  for (let i = 0; i < count; i += 1) {
    const fan = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.25, 0.5),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.6, 0.55),
      }),
    );
    const angle = (i / count) * Math.PI * 2;
    const r = 86 + Math.random() * 4;
    fan.position.set(Math.cos(angle) * r, 2.8 + Math.random() * 1.2, Math.sin(angle) * r);
    fan.lookAt(0, fan.position.y, 0);
    crowdMembers.push(fan);
    crowdContainer.add(fan);
  }
};
addCrowd(260);
scene.add(crowdContainer);

const createSimplePlayer = (shirt: string, trouser: string) => {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.4, 0.85),
    new THREE.MeshStandardMaterial({ color: shirt }),
  );
  body.position.y = 2.7;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#fcd34d" }),
  );
  head.position.y = 4.25;
  const legs = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2.2, 0.8),
    new THREE.MeshStandardMaterial({ color: trouser }),
  );
  legs.position.y = 1.1;
  group.add(body, head, legs);
  return group;
};

const striker = createSimplePlayer("#facc15", "#1e293b");
striker.position.set(0, 0, 15.8);
const bowler = createSimplePlayer("#ef4444", "#0f172a");
bowler.position.set(0, 0, -15);
const umpire = createSimplePlayer("#b91c1c", "#0f172a");
umpire.scale.set(0.9, 0.9, 0.9);
umpire.position.set(8.8, 0, 15.2);
scene.add(striker, bowler, umpire);

const makeStumps = (z: number) => {
  for (const x of [-0.28, 0, 0.28]) {
    const stump = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 1.8, 0.13),
      new THREE.MeshStandardMaterial({ color: "#f8fafc" }),
    );
    stump.position.set(x, 0.95, z);
    stump.castShadow = true;
    scene.add(stump);
  }
};
makeStumps(15.95);
makeStumps(-15.4);

const bat = new THREE.Mesh(
  new THREE.BoxGeometry(0.48, 4.8, 0.2),
  new THREE.MeshStandardMaterial({ color: "#92400e" }),
);
bat.position.set(1.1, 2.5, 14.8);
scene.add(bat);

const ball = new THREE.Mesh(
  new THREE.SphereGeometry(0.23, 18, 18),
  new THREE.MeshStandardMaterial({ color: "#dc2626", roughness: 0.3 }),
);
scene.add(ball);

const clock = new THREE.Clock();
let state: GameState = "idle";
let userRole: Role = "bat";
let difficulty: Difficulty = "medium";
let maxOvers = 2;
let innings = 1;
let battingTeam = 1;
let currentRuns = 0;
let wickets = 0;
let ballsInInnings = 0;
let target = 0;
let inningsScores: [number, number] = [0, 0];
let shotInput: ShotDirection | null = null;
let bowlQueued = false;

let swingPhase = 0;
let bowlAction = 0;
let canInteract = false;
const maxWickets = 3;

const ballVelocity = new THREE.Vector3();
const aiSwingBias = { easy: 0.55, medium: 0.75, hard: 0.9 };
const aiBowlPace = { easy: 0.43, medium: 0.52, hard: 0.61 };

const audioContext = new window.AudioContext();
const beep = (freq: number, durationMs: number) => {
  if (!soundToggle.checked) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + durationMs / 1000);
};

const vibrate = (duration: number) => {
  if (vibeToggle.checked && "vibrate" in navigator) navigator.vibrate(duration);
};

const isPlayerBatting = () => (innings === 1 ? userRole === "bat" : userRole === "bowl");
const totalBalls = () => maxOvers * 6;
const formatOvers = () => `${Math.floor(ballsInInnings / 6)}.${ballsInInnings % 6}`;

const updateHud = (message: string) => {
  statusEl.textContent = message;
  inningsEl.textContent = String(innings);
  scoreEl.textContent = String(currentRuns);
  wicketsEl.textContent = String(wickets);
  oversEl.textContent = formatOvers();
  targetEl.textContent = target > 0 ? String(target) : "-";
  modeEl.textContent = isPlayerBatting() ? "Batting" : "Bowling";
};

const resetBall = () => {
  ball.position.set((Math.random() - 0.5) * 0.9, 0.24, -15.8);
  ballVelocity.set(0, 0, aiBowlPace[difficulty]);
  canInteract = true;
  shotInput = null;
};

const applyQuality = () => {
  const high = qualityToggle.checked;
  const crowdCount = high ? 260 : 90;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, high ? 1.8 : 1));
  addCrowd(crowdCount);
};

const nextInnings = () => {
  inningsScores[innings - 1] = currentRuns;
  innings += 1;
  if (innings > 2) {
    state = "matchOver";
    const team1 = inningsScores[0];
    const team2 = inningsScores[1];
    const result = team1 === team2 ? "Match tied!" : team1 > team2 ? "Team 1 wins!" : "Team 2 wins!";
    updateHud(`Match over. ${result} (${team1}-${team2})`);
    return;
  }

  currentRuns = 0;
  wickets = 0;
  ballsInInnings = 0;
  battingTeam = 2;
  target = inningsScores[0] + 1;
  state = "betweenBalls";
  updateHud(`Innings break. Target is ${target}. Tap Next Ball.`);
  lastBallEl.textContent = "Innings break";
};

const endBall = (runs: number, event: string, wicket = false) => {
  ballsInInnings += 1;
  if (wicket) {
    wickets += 1;
    beep(220, 190);
    vibrate(120);
  } else {
    currentRuns += runs;
    beep(380 + runs * 55, 90);
    if (runs >= 4) vibrate(70);
  }

  lastBallEl.textContent = event;
  state = "betweenBalls";

  const chaseComplete = innings === 2 && target > 0 && currentRuns >= target;
  const allOut = wickets >= maxWickets;
  const oversDone = ballsInInnings >= totalBalls();

  if (chaseComplete || allOut || oversDone) {
    nextInnings();
    return;
  }

  updateHud(`${event}. Tap Next Ball.`);
};

const randomByDifficulty = () => {
  if (difficulty === "easy") return Math.random() * 0.85;
  if (difficulty === "hard") return Math.random() * 1.1;
  return Math.random();
};

const simulatePlayerBowlingBall = () => {
  const lineControl = shotInput === "leg" ? -0.7 : shotInput === "off" ? 0.7 : 0;
  const lineError = (Math.random() - 0.5) * (difficulty === "hard" ? 0.7 : 1.1);
  const pace = aiBowlPace[difficulty] + Math.random() * 0.08;
  ball.position.x = lineControl + lineError;
  ballVelocity.set((Math.random() - 0.5) * 0.03, 0.07, pace);
  canInteract = false;
};

const scoreFromPower = (power: number) => {
  if (power > 1.08) return 6;
  if (power > 0.85) return 4;
  if (power > 0.63) return 2;
  return 1;
};

const deliver = () => {
  if (state !== "betweenBalls" && state !== "idle") return;
  state = "delivery";
  bowlQueued = false;

  if (isPlayerBatting()) {
    ball.position.set((Math.random() - 0.5) * 0.8, 0.24, -15.8);
    const swing = (Math.random() - 0.5) * (difficulty === "hard" ? 0.13 : 0.2);
    const pace = aiBowlPace[difficulty] + Math.random() * 0.1;
    ballVelocity.set(swing, 0.08, pace);
    updateHud("Watch the ball and play your shot.");
    canInteract = true;
  } else {
    simulatePlayerBowlingBall();
    updateHud("Delivery bowled. AI batsman reacting...");
  }
};

const setShot = (direction: ShotDirection) => {
  shotInput = direction;
  if (state === "delivery" && isPlayerBatting()) {
    swingPhase = 1;
  }
};

const startMatch = () => {
  userRole = roleSelect.value as Role;
  difficulty = difficultySelect.value as Difficulty;
  maxOvers = Number(oversSelect.value);
  innings = 1;
  battingTeam = userRole === "bat" ? 1 : 2;
  currentRuns = 0;
  wickets = 0;
  ballsInInnings = 0;
  target = 0;
  inningsScores = [0, 0];
  state = "betweenBalls";
  lastBallEl.textContent = "-";
  updateHud("Match started. Tap Next Ball.");
  resetBall();
};

nextBallBtn.addEventListener("click", deliver);
startBtn.addEventListener("click", startMatch);
resetBtn.addEventListener("click", startMatch);
bowlBtn.addEventListener("click", () => {
  shotInput = "straight";
  bowlQueued = true;
});
shotLeftBtn.addEventListener("click", () => setShot("leg"));
shotStraightBtn.addEventListener("click", () => setShot("straight"));
shotRightBtn.addEventListener("click", () => setShot("off"));

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") setShot("straight");
  if (event.key.toLowerCase() === "a") setShot("leg");
  if (event.key.toLowerCase() === "d") setShot("off");
  if (event.key.toLowerCase() === "b") bowlQueued = true;
});

cameraSlider.addEventListener("input", () => {
  camera.position.y = Number(cameraSlider.value);
});
qualityToggle.addEventListener("change", applyQuality);

const resize = () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
};
window.addEventListener("resize", resize);

const animate = () => {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  boundary.rotation.z += dt * 0.12;
  crowdMembers.forEach((fan, idx) => {
    fan.position.y += Math.sin(performance.now() * 0.002 + idx) * 0.002;
  });

  if (state === "delivery") {
    ball.position.addScaledVector(ballVelocity, dt * 60);
    ball.rotation.x += dt * 16;
    ballVelocity.y -= 0.004;
    ball.position.y = Math.max(0.24, ball.position.y + ballVelocity.y * dt * 60);

    if (ball.position.y <= 0.24 && ballVelocity.y < 0) {
      ballVelocity.y *= -0.4;
      ballVelocity.z *= 0.82;
    }

    bowler.position.z = -15 + Math.sin(performance.now() * 0.006) * 0.6;
    bowlAction = Math.min(1, bowlAction + dt * 2.4);

    if (isPlayerBatting()) {
      if (shotInput && canInteract && ball.position.z > 13.2) {
        canInteract = false;
        const timingError = Math.abs(ball.position.z - 12.65) + Math.abs(ball.position.x) * 1.5;
        const dirFactor = shotInput === "leg" ? -0.3 : shotInput === "off" ? 0.3 : 0;
        const power = THREE.MathUtils.clamp(1.12 - timingError * 0.33 + (Math.random() - 0.5) * 0.08, 0.24, 1.2);
        ballVelocity.set(dirFactor, 0.13 + power * 0.08, -0.25 - power * 0.22);

        if (power < 0.38) {
          endBall(0, "Bowled", true);
        } else {
          const runs = scoreFromPower(power);
          endBall(runs, `${runs} run${runs > 1 ? "s" : ""}`);
        }
      }

      if (ball.position.z > 18 && canInteract) {
        endBall(0, "Dot ball");
      }
    } else {
      if (ball.position.z > 10.8 && canInteract) {
        canInteract = false;
        const aiSkill = aiSwingBias[difficulty] + randomByDifficulty() * 0.3;
        const wicketChance = Math.max(0.08, 0.3 - aiSkill * 0.22);

        if (Math.random() < wicketChance) {
          endBall(0, "AI Wicket", true);
        } else {
          const runs = aiSkill > 0.95 ? 4 : aiSkill > 0.72 ? 2 : 1;
          endBall(runs, `AI scored ${runs}`);
        }
      }
    }
  }

  if (state === "betweenBalls" && bowlQueued && !isPlayerBatting()) {
    deliver();
  }

  swingPhase = Math.max(0, swingPhase - dt * 2.8);
  bat.rotation.z = -0.12 - swingPhase * 1.18;
  bat.rotation.x = 0.07 + swingPhase * 0.4;

  striker.rotation.y = shotInput === "leg" ? 0.2 : shotInput === "off" ? -0.2 : 0;
  umpire.rotation.x = state === "matchOver" ? -0.2 : 0;
  if (lastBallEl.textContent?.includes("6")) {
    umpire.rotation.z = -1.5;
  } else if (lastBallEl.textContent?.includes("Wicket") || lastBallEl.textContent?.includes("Bowled")) {
    umpire.rotation.z = 0;
  }

  camera.lookAt(0, 2.5, 0);
  renderer.render(scene, camera);
};

applyQuality();
resize();
resetBall();
updateHud("Configure role/settings and start your cricket match.");
animate();
