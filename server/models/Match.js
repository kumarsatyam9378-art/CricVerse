const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchType: {
        type: String,
        enum: ['Quick', 'Tournament', '1v1'],
        default: 'Quick'
    },
    playerAvatar: {
        type: String,
        required: true // e.g., "Virat Kohli"
    },
    score: {
        type: Number,
        required: true
    },
    result: {
        type: String, // "Win", "Loss", "Abandoned"
        required: true
    },
    rewards: {
        coinsEarned: { type: Number, default: 0 },
        xpGained: { type: Number, default: 0 }
    },
    log: [
        {
            ballNumber: Number,
            action: String, // "Aggressive Shot"
            outcome: String, // "6 Runs"
            timestamp: Date
        }
    ],
    playedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexing for faster Leaderboard queries
MatchSchema.index({ score: -1 });

module.exports = mongoose.model('Match', MatchSchema);
