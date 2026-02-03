// app.js
import { controls } from './data.js';
import { generateContent } from './ai.js';

// 1. Get User Data
const sessionData = localStorage.getItem('cricSession');
if (!sessionData) window.location.href = 'index.html'; // Security redirect

const user = JSON.parse(sessionData);

// 2. Setup HUD
document.getElementById('hud-player').innerText = user.name;
document.getElementById('hud-role').innerText = user.role.toUpperCase();

// 3. Render Role-Based Buttons
const btnContainer = document.getElementById('btn-container');
const myControls = controls[user.role]; // Get buttons for specific role

myControls.forEach(actionName => {
    const btn = document.createElement('button');
    btn.innerText = actionName;
    
    // Add dynamic class for color (e.g., btn-Aggressive)
    btn.className = `control-btn btn-${actionName.split(' ')[0]}`; 
    
    btn.onclick = () => playMove(actionName);
    btnContainer.appendChild(btn);
});

// 4. Handle Gameplay
async function playMove(action) {
    const feed = document.getElementById('ai-feed');
    const visual = document.getElementById('visual-feed');
    const buttons = document.querySelectorAll('.control-btn');

    // Disable buttons
    buttons.forEach(b => b.disabled = true);
    buttons.forEach(b => b.style.opacity = '0.5');
    
    feed.innerHTML = `> Executing ${action}...`;

    // Call AI
    const result = await generateContent(user.name, user.role, action);

    // Update UI
    feed.innerHTML = `> <b>${action.toUpperCase()}:</b> ${result.text}`;
    
    if (result.imageUrl) {
        visual.src = result.imageUrl;
        visual.style.display = 'block';
    }

    // Enable buttons
    buttons.forEach(b => b.disabled = false);
    buttons.forEach(b => b.style.opacity = '1');
}
