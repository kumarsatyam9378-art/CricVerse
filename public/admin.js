/* =========================================
   ADMIN PANEL LOGIC (Simulated Backend)
   Features: User Management, Ban Hammer, Real-time Logs
   ========================================= */

// MOCK DATA
const mockUsers = [
    { id: "USR_992", name: "Rahul_Gamer", role: "Player", status: "Active" },
    { id: "USR_104", name: "Ankit_Pro", role: "Player", status: "Active" },
    { id: "USR_552", name: "Hacker_X", role: "Player", status: "Suspicious" },
    { id: "USR_883", name: "Sneha_Cric", role: "VIP", status: "Active" },
    { id: "USR_110", name: "Bot_Account", role: "Bot", status: "Banned" }
];

const tableBody = document.getElementById('user-table');
const logContainer = document.getElementById('sys-log');
const activeCount = document.getElementById('active-count');
const revenueCount = document.getElementById('revenue-count');

// 1. INITIALIZE
function initAdmin() {
    renderTable();
    updateStats();
    addLog("System initialized. Connected to Database.");
    
    // Simulate Random Activity
    setInterval(() => {
        if(Math.random() > 0.7) {
            addLog(`New connection request from IP: 192.168.1.${Math.floor(Math.random()*255)}`);
            activeCount.innerText = parseInt(activeCount.innerText) + 1;
        }
    }, 2000);
}

// 2. RENDER TABLE
function renderTable() {
    tableBody.innerHTML = '';
    
    mockUsers.forEach(user => {
        const tr = document.createElement('tr');
        const isBanned = user.status === "Banned";
        
        tr.innerHTML = `
            <td style="color:#666;">${user.id}</td>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td style="color:${getColor(user.status)}">${user.status}</td>
            <td>
                ${isBanned 
                    ? `<button class="btn" onclick="unbanUser('${user.id}')">UNBAN</button>` 
                    : `<button class="btn btn-danger" onclick="banUser('${user.id}')">BAN</button>`
                }
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// 3. ACTIONS
window.banUser = (id) => {
    const user = mockUsers.find(u => u.id === id);
    if(user) {
        if(confirm(`Are you sure you want to BAN ${user.name}?`)) {
            user.status = "Banned";
            renderTable();
            addLog(`⚠️ ACTION: Admin BANNED user ${user.name} (${id})`);
            updateStats();
        }
    }
};

window.unbanUser = (id) => {
    const user = mockUsers.find(u => u.id === id);
    if(user) {
        user.status = "Active";
        renderTable();
        addLog(`ACTION: Admin revoked ban for ${user.name}`);
    }
};

// 4. UTILS
function getColor(status) {
    if(status === 'Active') return '#0f0';
    if(status === 'Banned') return '#f00';
    if(status === 'Suspicious') return '#ff0';
    return '#fff';
}

function addLog(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    logContainer.prepend(div);
}

function updateStats() {
    activeCount.innerText = Math.floor(Math.random() * 50) + 100;
    revenueCount.innerText = (parseInt(revenueCount.innerText) + Math.floor(Math.random() * 500)).toLocaleString();
}

// Start
initAdmin();
