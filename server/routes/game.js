const express = require('express');
const User = require('../models/User');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/game/start
// @desc    Start a match (Deduct Entry Fee)
router.post('/start', protect, async (req, res) => {
    try {
        const { entryFee, playerAvatar } = req.body;
        const user = req.user;

        // 1. Check Balance
        if (user.wallet.balance < entryFee) {
            return res.status(400).json({ success: false, message: 'Insufficient Balance in Wallet' });
        }

        // 2. Deduct Money
        user.wallet.balance -= entryFee;
        user.stats.matchesPlayed += 1;
        await user.save();

        // 3. Create Match Record (Status: In-Progress)
        const match = await Match.create({
            userId: user._id,
            playerAvatar,
            score: 0,
            result: 'Playing'
        });

        res.status(200).json({
            success: true,
            newBalance: user.wallet.balance,
            matchId: match._id
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/game/end
// @desc    End match, Save Score & Distribute Winnings
router.post('/end', protect, async (req, res) => {
    try {
        const { matchId, finalScore, ballLog } = req.body;
        
        // 1. Find Match
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        // 2. Update Match
        match.score = finalScore;
        match.log = ballLog; // Save every ball detail for anti-cheat
        match.result = 'Completed';
        
        // 3. Update User Stats (High Score Logic)
        const user = req.user;
        if (finalScore > user.stats.highestScore) {
            user.stats.highestScore = finalScore;
        }
        user.stats.totalRuns += finalScore;

        // 4. Calculate Rewards (Simple Logic for now)
        // If score > 50, give bonus coins
        let reward = 0;
        if (finalScore >= 50) reward = 20;
        if (finalScore >= 100) reward = 50;

        if (reward > 0) {
            user.wallet.balance += reward;
            match.rewards.coinsEarned = reward;
        }

        await match.save();
        await user.save();

        res.status(200).json({
            success: true,
            reward,
            newBalance: user.wallet.balance
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/game/leaderboard
// @desc    Get Top 10 Players Globally
router.get('/leaderboard', async (req, res) => {
    try {
        // Find top 10 users sorted by highestScore
        const leaders = await User.find()
            .sort({ 'stats.highestScore': -1 })
            .limit(10)
            .select('username stats.highestScore wallet.isKyVerified');

        res.status(200).json({
            success: true,
            data: leaders
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
