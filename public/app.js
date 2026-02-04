/* =========================================
   MAIN APPLICATION LOGIC (Production V1.2)
   Orchestrates: UI Events, Game State, AI Calls
   Connects: game.html <-> data.js <-> ai.js <-> sound.js <-> database.js
   ========================================= */

import { controls, gameMessages } from './data.js';
import { GameEngine } from './ai.js';
import { SoundEngine } from './sound.js';
import { Format } from './utils.js';
import { DB } from './database.js'; // <-- DATABASE IMPORTED

// --- GLOBAL STATE ---
const State = {
    user: null,         // Player object from LocalStorage
    score: 0,           // Current session score
    turnCount: 0,       // Number of balls/actions played
    isProcessing: false // Lock to prevent double clicks
};

// --- DOM ELEMENTS CACHE ---
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
   1. INITIALIZATION & VALIDATION
   ========================================= */
function initGame() {
    const sessionRaw = localStorage.getItem('CV_CurrentPlayer');
    
    if (!sessionRaw) {
        alert("Session Expired. Returning to Lobby.");
        window.location.href = 'index.html';
        return;
    }

    try {
        State.user = JSON.parse(sessionRaw);
    } catch (e) {
        window.location.href = 'index.html';
        return;
    }

    setupHUD();
    renderControls();

    // STARTING SOUNDS
    SoundEngine.playSFX('click');
    logToFeed(gameMessages.loading, 'SYSTEM');
    
    setTimeout(() => {
        logToFeed(`Connected to stadium. ${State.user.name} is ready!`, 'SYSTEM');
        SoundEngine.playSFX('cheer'); 
        UI.status.innerText = "Live Stream Active";
        UI.status.style.color = "#00ff9d";
    }, 1500);
}

/* =========================================
   2. UI RENDERING FUNCTIONS
   ========================================= */
function setupHUD() {
    UI.hudName.innerText = State.user.name;
    UI.hudRole.innerText = State.user.role.toUpperCase();
    UI.hudAvatar.innerText = State.user.avatar;
    updateScore(0);
}

function renderControls() {
    UI.controlsGrid.innerHTML = ''; 
    const roleActions = controls[State.user.role] || controls['Batter'];

    roleActions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `action-btn btn-style-${action.style}`;
        btn.innerHTML = `
            <span>${action.label}</span>
            <div style="font-size:0.6rem; opacity:0.8; margin-top:2px;">
                Risk: ${action.risk}%
            </div>
        `;
        btn.onclick = () => handlePlayerMove(action);
        UI.controlsGrid.appendChild(btn);
    });
}

function updateScore(points) {
    State.score += points;
    if (State.score < 0) State.score = 0;
    UI.hudScore.innerText = State.score;
}

function logToFeed(message, sender = 'COMMENTARY') {
    const time = Format.timestamp(); 
    const entry = document.createElement('div');
    entry.style.marginBottom = "10px";
    entry.innerHTML = `
        <span style="color:var(--text-muted); font-size:0.7rem;">[${time}]</span> 
        <b style="color:${sender === 'SYSTEM' ? 'var(--accent-success)' : 'var(--primary)'}">${sender}:</b> 
        <span>${message}</span>
    `;
    UI.feed.appendChild(entry);
    UI.feed.scrollTop = UI.feed.scrollHeight;
}

/* =========================================
   3. CORE GAMEPLAY LOGIC
   ========================================= */
async function handlePlayerMove(actionData) {
    if (State.isProcessing) return; 
    
    SoundEngine.playSFX('click'); 
    setLoadingState(true);
    State.turnCount++;

    logToFeed(`Attempting ${actionData.label}...`, 'PLAYER');
    UI.status.innerText = "AI Processing...";

    try {
        const response = await GameEngine.processTurn(State.user, actionData);

        logToFeed(response.commentary);
        SoundEngine.speakCommentary(response.commentary); 

        if (response.visual) {
            UI.visualImg.onload = () => {
                UI.visualImg.style.display = 'block';
                UI.visualLoader.style.display = 'none';
            };
            UI.visualImg.src = response.visual;
        }

        updateScore(response.statsUpdate);

        if (response.statsUpdate > 0) {
            SoundEngine.playSFX('batHit'); 
            if (response.statsUpdate >= 4) SoundEngine.playSFX('cheer');
        } else if (response.result.includes("Out")) {
            SoundEngine.playSFX('wickets'); 
        }

        UI.status.innerText = `Result: ${response.result}`;
        UI.status.style.color = response.statsUpdate > 0 ? "#00ff9d" : "#ff0055";

    } catch (error) {
        logToFeed("Connection interrupted. Please retry.", "SYSTEM");
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    State.isProcessing = isLoading;
    const btns = document.querySelectorAll('.action-btn');
    btns.forEach(b => {
        b.disabled = isLoading;
        b.style.opacity = isLoading ? '0.5' : '1';
    });

    if (isLoading) {
        UI.visualLoader.style.display = 'block';
        UI.visualImg.style.display = 'none';
    }
}

/* =========================================
   4. DATABASE SYNC & EXIT
   ========================================= */
UI.exitBtn.onclick = async () => {
    SoundEngine.playSFX('click');
    
    if (confirm("End Match & Save Score to Leaderboard?")) {
        // 1. Lock UI
        UI.exitBtn.innerText = "Saving...";
        UI.exitBtn.disabled = true;

        try {
            // 2. Prepare Data
            const userData = {
                uid: State.user.uid || 'guest_' + Date.now(),
                name: State.user.name,
                photo: State.user.avatar || '🏏'
            };

            // 3. Save to MongoDB via database.js
            if (State.score > 0) {
                await DB.saveScore(userData, State.score);
                console.log("Score synced successfully.");
            }

            // 4. Cleanup & Redirect
            localStorage.removeItem('CV_CurrentPlayer');
            window.location.href = 'index.html';

        } catch (error) {
            console.error("Failed to save score:", error);
            alert("Error saving score. Please check your connection.");
            UI.exitBtn.innerText = "EXIT MATCH";
            UI.exitBtn.disabled = false;
        }
    }
};

window.onload = initGame;
