/* =========================================
   MAIN APPLICATION LOGIC (Firebase Backend)
   Connects: Game Logic <-> Firebase Firestore
   ========================================= */

import { controls, gameMessages } from './data.js';
import { GameEngine } from './ai.js';
import { SoundEngine } from './sound.js';
import { Format } from './utils.js';

// --- FIREBASE IMPORTS (Directly from CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- YOUR FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyDXpmQTDZgn_JvtgrEH3tVLzb-XyggLs_M",
    authDomain: "midnight-library-satyam-media.firebaseapp.com",
    projectId: "midnight-library-satyam-media",
    storageBucket: "midnight-library-satyam-media.firebasestorage.app",
    messagingSenderId: "842047619495",
    appId: "1:842047619495:web:7483bc7e4a9029d6dc7682"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- GLOBAL STATE ---
const State = {
    user: null,         
    score: 0,           
    turnCount: 0,       
    isProcessing: false 
};

const UI = {
    hudName: document.getElementById('hud-name'),
    hudRole: document.getElementById('hud-role'),
    hudAvatar: document.getElementById('hud-avatar'),
    hudScore: document.getElementById('hud-score'),
    visualImg: document.getElementById('game-visual'),
    visualLoader: document.getElementById('visual-loader'),
    feed: document.getElementById('ai-feed'),
    status: document.getElementById('connection-status'),
    controlsGrid: document.getElementById('controls-grid'),
    exitBtn: document.getElementById('exit-btn')
};

/* =========================================
   1. INITIALIZATION
   ========================================= */
function initGame() {
    const sessionRaw = localStorage.getItem('CV_CurrentPlayer');
    if (!sessionRaw) {
        window.location.href = 'index.html';
        return;
    }
    State.user = JSON.parse(sessionRaw);
    setupHUD();
    renderControls();
    
    SoundEngine.playSFX('click');
    logToFeed(gameMessages.loading, 'SYSTEM');
}

function setupHUD() {
    UI.hudName.innerText = State.user.name;
    UI.hudRole.innerText = State.user.role.toUpperCase();
    UI.hudAvatar.innerText = State.user.avatar;
    UI.hudScore.innerText = State.score;
}

function renderControls() {
    UI.controlsGrid.innerHTML = ''; 
    const roleActions = controls[State.user.role] || controls['Batter'];
    roleActions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `action-btn btn-style-${action.style}`;
        btn.innerHTML = `<span>${action.label}</span><div style="font-size:0.6rem; opacity:0.8;">Risk: ${action.risk}%</div>`;
        btn.onclick = () => handlePlayerMove(action);
        UI.controlsGrid.appendChild(btn);
    });
}

function logToFeed(message, sender = 'COMMENTARY') {
    const time = Format.timestamp(); 
    const entry = document.createElement('div');
    entry.style.marginBottom = "10px";
    entry.innerHTML = `<span style="color:#666; font-size:0.7rem;">[${time}]</span> <b style="color:var(--primary)">${sender}:</b> <span>${message}</span>`;
    UI.feed.appendChild(entry);
    UI.feed.scrollTop = UI.feed.scrollHeight;
}

/* =========================================
   2. GAMEPLAY & AI
   ========================================= */
async function handlePlayerMove(actionData) {
    if (State.isProcessing) return;
    State.isProcessing = true;
    SoundEngine.playSFX('click');
    setLoadingState(true);

    try {
        const response = await GameEngine.processTurn(State.user, actionData);
        logToFeed(response.commentary);
        SoundEngine.speakCommentary(response.commentary);

        if (response.visual) {
            UI.visualImg.src = response.visual;
            UI.visualImg.style.display = 'block';
            UI.visualLoader.style.display = 'none';
        }

        State.score += response.statsUpdate;
        UI.hudScore.innerText = State.score;

        if (response.statsUpdate > 0) {
            SoundEngine.playSFX('batHit');
            if (response.statsUpdate >= 4) SoundEngine.playSFX('cheer');
        } else if (response.result.includes("Out")) {
            SoundEngine.playSFX('wickets');
        }

        UI.status.innerText = `Result: ${response.result}`;
    } catch (error) {
        logToFeed("AI Engine Busy...", "SYSTEM");
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    State.isProcessing = isLoading;
    document.querySelectorAll('.action-btn').forEach(b => b.disabled = isLoading);
    if (isLoading) {
        UI.visualLoader.style.display = 'block';
        UI.visualImg.style.display = 'none';
    }
}

/* =========================================
   3. SAVE TO FIREBASE & EXIT
   ========================================= */
UI.exitBtn.onclick = async () => {
    if (confirm("End Match & Save Score to Firebase?")) {
        UI.exitBtn.innerText = "Syncing...";
        UI.exitBtn.disabled = true;

        try {
            // Get User Token from LocalStorage
            const authToken = localStorage.getItem('CV_AuthToken');
            
            // Firebase Firestore Save Logic
            // Collection: 'leaderboard' | Document ID: user_uid
            const userRef = doc(db, "leaderboard", State.user.id || "guest_" + Date.now());
            
            await setDoc(userRef, {
                name: State.user.name,
                score: State.score,
                role: State.user.role,
                avatar: State.user.avatar,
                lastUpdated: serverTimestamp()
            }, { merge: true });

            console.log("Score saved to Firebase!");
            window.location.href = 'index.html';
        } catch (e) {
            console.error("Firebase Error:", e);
            alert("Sync Failed!");
            UI.exitBtn.innerText = "EXIT MATCH";
            UI.exitBtn.disabled = false;
        }
    }
};

window.onload = initGame;
