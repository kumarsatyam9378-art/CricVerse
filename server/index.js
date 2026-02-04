/* =========================================
   CRICVERSE BACKEND - MAIN SERVER
   Technology: Node.js, Express, Cors, Helmet
   Level: Production Grade
   ========================================= */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. SECURITY MIDDLEWARE (Pro Level)
app.use(helmet()); // Hides server info from hackers
app.use(cors({
    origin: '*', // Allow connections (Restrict in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. RATE LIMITING (DDoS Protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter);

// 3. BODY PARSER
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// 4. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Database Connected (Cluster 0)'))
.catch((err) => {
    console.error('❌ Database Connection Error:', err.message);
    process.exit(1); // Stop server if DB fails
});

// 5. API ROUTES
app.use('/api/auth', authRoutes);     // Login/Register
app.use('/api/game', gameRoutes);     // Match Logic
app.use('/api/payment', paymentRoutes); // Wallet/Transactions

// 6. SERVE FRONTEND (Production Mode)
// Ye line public folder ko server ke saath jodti hai
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 7. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`\n🚀 CRICVERSE SERVER STARTED`);
    console.log(`📡 Mode: ${process.env.NODE_ENV || 'Development'}`);
    console.log(`🔗 Port: ${PORT}`);
});
