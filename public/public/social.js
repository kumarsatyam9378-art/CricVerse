/* =========================================
   SOCIAL HUB LOGIC
   Features: Chat Simulation, Message Handling
   ========================================= */

import { Random } from './utils.js';

const feed = document.getElementById('chat-feed');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Fake User Database for Chat Simulation
const bots = [
    { name: "CricketLover99", color: "#ff0055" },
    { name: "DhoniFan_7", color: "#ffd700" },
    { name: "KohliStats", color: "#00f2ff" },
    { name: "MumbaiIndiansOP", color: "#0099ff" },
    { name: "RawalpindiExp", color: "#00ff9d" }
];

const messages = [
    "Kohli is definitely hitting a century today! 👑",
    "Bumrah's yorker is unplayable man...",
    "Anyone up for a 1v1 challenge?",
    "Rohit needs to pull that shot!",
    "Dream11 team kya banayi hai sabne?",
    "Pitch looks dry, spinners will dominate.",
    "CricVerse graphics are insane! 🔥"
];

// 1. INIT
function initChat() {
    // Scroll to bottom
    feed.scrollTop = feed.scrollHeight;
    
    // Start Bot Loop
    setInterval(simulateIncomingMsg, 3500);
}

// 2. SEND MESSAGE (USER)
sendBtn.onclick = () => sendMessage();
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addBubble(text, 'user', 'You');
    input.value = '';
}

// 3. RECEIVE MESSAGE (BOT)
function simulateIncomingMsg() {
    // 30% chance to send a message
    if (Math.random() > 0.3) {
        const bot = Random.choice(bots);
        const msg = Random.choice(messages);
        addBubble(msg, 'other', bot.name, bot.color);
    }
}

// 4. UI BUILDER
function addBubble(text, type, name, color = '#aaa') {
    const div = document.createElement('div');
    div.className = `msg msg-${type}`;
    
    if (type === 'other') {
        div.innerHTML = `<span class="sender-name" style="color:${color}">${name}</span>${text}`;
    } else {
        div.innerHTML = text;
    }

    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight; // Auto scroll
}

// Start
initChat();
