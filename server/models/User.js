const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password encryption

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // Don't return password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'bot'],
        default: 'user'
    },
    wallet: {
        balance: { type: Number, default: 100 },
        currency: { type: String, default: 'INR' },
        isKyVerified: { type: Boolean, default: false }
    },
    stats: {
        matchesPlayed: { type: Number, default: 0 },
        totalRuns: { type: Number, default: 0 },
        highestScore: { type: Number, default: 0 },
        wicketsTaken: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password before saving (Security Best Practice)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
