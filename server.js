/* =========================================
   CRICVERSE BACKEND SERVER (Node.js)
   Handles: Static Asset Serving, Routing, Security
   ========================================= */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. SECURITY MIDDLEWARE
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com"], // Allow Firebase
            imgSrc: ["'self'", "data:", "https://pollinations.ai", "https://cdn-icons-png.flaticon.com", "https://ui-avatars.com", "https://lh3.googleusercontent.com"], // Allow AI Images & Google Profile
            connectSrc: ["'self'", "https://pollinations.ai", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"], // Allow API calls
        },
    },
}));

app.use(cors());

// 2. SERVE STATIC FILES (From 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));

// 3. ROUTE HANDLING
// Redirect root to index.html explicitly (optional, express.static does this usually)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback for any other route (SPA behavior) - Redirects to Home
app.get('*', (req, res) => {
    res.redirect('/');
});

// 4. START SERVER
app.listen(PORT, () => {
    console.log(`\n🏏 CRICVERSE STADIUM IS LIVE!`);
    console.log(`⚡ Server running on port: ${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} to play\n`);
});
