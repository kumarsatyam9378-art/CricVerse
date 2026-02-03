/* =========================================
   WALLET SYSTEM (Logic Layer)
   Handles: Balance, Deposits, Transaction History
   ========================================= */

import { Format, Random } from './utils.js';

// DOM ELEMENTS
const balDisplay = document.getElementById('wallet-balance');
const txnContainer = document.getElementById('txn-history');
const addBtn = document.getElementById('add-cash-btn');

// STATE
let walletState = {
    balance: 100.00, // Starting Bonus
    history: []
};

// 1. INITIALIZE
function initWallet() {
    loadWalletData();
    renderUI();
}

// 2. DATA MANAGEMENT
function loadWalletData() {
    const saved = localStorage.getItem('CV_Wallet');
    if (saved) {
        walletState = JSON.parse(saved);
    } else {
        // Create Mock History for new users
        walletState.history = [
            { type: 'credit', desc: 'Welcome Bonus', amount: 100, date: new Date().toLocaleDateString() },
            { type: 'debit', desc: 'Contest Fee (Match 1)', amount: 25, date: 'Yesterday' }
        ];
        saveWallet();
    }
}

function saveWallet() {
    localStorage.setItem('CV_Wallet', JSON.stringify(walletState));
    // Trigger custom event so other pages know balance changed
    window.dispatchEvent(new Event('storage'));
}

// 3. UI RENDERING
function renderUI() {
    // Animate Balance Count
    balDisplay.innerText = walletState.balance.toFixed(2);
    
    // Render History
    txnContainer.innerHTML = '';
    walletState.history.reverse().forEach(txn => {
        const div = document.createElement('div');
        div.className = 'txn-item fade-in';
        
        const isCredit = txn.type === 'credit';
        const icon = isCredit ? '↓' : '↑';
        const colorClass = isCredit ? 'icon-credit' : 'icon-debit';
        const amountColor = isCredit ? 'amount-green' : 'amount-red';
        const sign = isCredit ? '+' : '-';

        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div class="txn-icon ${colorClass}">${icon}</div>
                <div>
                    <div style="font-weight:bold; font-size:0.9rem;">${txn.desc}</div>
                    <div style="font-size:0.7rem; color:#888;">${txn.date}</div>
                </div>
            </div>
            <div class="${amountColor}">
                ${sign}₹${txn.amount}
            </div>
        `;
        txnContainer.appendChild(div);
    });
}

// 4. ACTIONS
addBtn.onclick = () => {
    // Simulate Payment Gateway
    const amount = prompt("ENTER AMOUNT TO ADD (₹):", "500");
    
    if (amount && !isNaN(amount)) {
        addBtn.innerText = "Processing...";
        setTimeout(() => {
            const val = parseFloat(amount);
            
            // Update State
            walletState.balance += val;
            walletState.history.push({
                type: 'credit',
                desc: 'UPI Deposit / GPay',
                amount: val,
                date: 'Just Now'
            });
            
            saveWallet();
            renderUI();
            
            alert(`Success! ₹${val} added to CricVerse Wallet.`);
            addBtn.innerText = "+ ADD CASH";
        }, 1500); // Fake delay
    }
};

// Start
initWallet();
