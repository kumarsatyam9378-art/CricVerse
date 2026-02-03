/* =========================================
   MAIN APPLICATION LOGIC (Production V1.0)
   Orchestrates: UI Events, Game State, AI Calls
   Connects: game.html <-> data.js <-> ai.js
   ========================================= */

import { controls, gameMessages } from './data.js';
import { GameEngine } from './ai.js';

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
    // A. Check Session
    const sessionRaw = localStorage.getItem('CV_CurrentPlayer');
    
    if (!sessionRaw) {
        alert("Session Expired. Returning to Lobby.");
        window.location.href = 'index.html';
        return;
    }

    try {
        State.user = JSON.parse(sessionRaw);
    } catch (e) {
        console.error("Corrupt Session Data", e);
        window.location.href = 'index.html';
        return;
    }

    // B. Setup HUD
    setupHUD();

    // C. Generate Controls
    renderControls();

    // D. Initial System Message
    logToFeed(gameMessages.loading, 'SYSTEM');
    
    // Simulate initial satellite connection
    setTimeout(() => {
        logToFeed(`Connected to stadium. ${State.user.name} is walking out to the middle.`, 'SYSTEM');
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
    UI.controlsGrid.innerHTML = ''; // Clear loaders

    // Get specific buttons for the user's role (Batter/Bowler)
    const roleActions = controls[State.user.role] || controls['Batter']; // Fallback

    roleActions.forEach(action => {
        const btn = document.createElement('button');
        
        // Style based on risk/type
        btn.className = `action-btn btn-style-${action.style}`;
        
        // Content
        btn.innerHTML = `
            <span>${action.label}</span>
            <div style="font-size:0.6rem; opacity:0.8; margin-top:2px;">
                Risk: ${action.risk}%
            </div>
        `;

        // Event Listener
        btn.onclick = () => handlePlayerMove(action);

        UI.controlsGrid.appendChild(btn);
    });
}

function updateScore(points) {
    State.score += points;
    // Prevent negative score
    if (State.score < 0) State.score = 0;
    
    // Animate counter (simple implementation)
    UI.hudScore.innerText = State.score;
}

function logToFeed(message, sender = 'COMMENTARY') {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    const entry = document.createElement('div');
    entry.style.marginBottom = "10px";
    entry.innerHTML = `
        <span style="color:var(--text-muted); font-size:0.7rem;">[${time}]</span> 
        <b style="color:${sender === 'SYSTEM' ? 'var(--accent-success)' : 'var(--primary)'}">${sender}:</b> 
        <span>${message}</span>
    `;
    
    UI.feed.appendChild(entry);
    
    // Auto Scroll to bottom
    UI.feed.scrollTop = UI.feed.scrollHeight;
}

/* =========================================
   3. CORE GAMEPLAY LOGIC
   ========================================= */
async function handlePlayerMove(actionData) {
    if (State.isProcessing) return; // Prevent spam
    
    // 1. LOCK UI
    setLoadingState(true);
    State.turnCount++;

    // 2. UPDATE FEED (Immediate Feedback)
    logToFeed(`Attempting ${actionData.label}...`, 'PLAYER');
    UI.status.innerText = "AI Processing...";
    UI.status.style.color = "yellow";

    try {
        // 3. CALL AI ENGINE
        const response = await GameEngine.processTurn(State.user, actionData);

        // 4. HANDLE TEXT RESULT
        logToFeed(response.commentary);

        // 5. HANDLE VISUAL RESULT
        if (response.visual) {
            UI.visualImg.onload = () => {
                UI.visualImg.style.display = 'block';
                UI.visualLoader.style.display = 'none';
            };
            UI.visualImg.src = response.visual;
        }

        // 6. UPDATE GAME STATS
        updateScore(response.statsUpdate);

        // 7. FLASH RESULT MESSAGE
        UI.status.innerText = `Result: ${response.result}`;
        UI.status.style.color = response.result.includes("Success") ? "#00ff9d" : "#ff0055";

    } catch (error) {
        console.error("Turn Error:", error);
        logToFeed("Connection interrupted. Please retry.", "SYSTEM");
    } finally {
        // 8. UNLOCK UI
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    State.isProcessing = isLoading;
    
    const btns = document.querySelectorAll('.action-btn');
    btns.forEach(b => {
        b.disabled = isLoading;
        b.style.opacity = isLoading ? '0.5' : '1';
        b.style.cursor = isLoading ? 'not-allowed' : 'pointer';
    });

    if (isLoading) {
        UI.visualLoader.style.display = 'block';
        UI.visualImg.style.display = 'none';
    }
}

/* =========================================
   4. EVENT LISTENERS
   ========================================= */
UI.exitBtn.onclick = () => {
    if (confirm("Leave the stadium? Your current score will be lost.")) {
        localStorage.removeItem('CV_CurrentPlayer');
        window.location.href = 'index.html';
    }
};

// Start the Game
window.onload = initGame;
