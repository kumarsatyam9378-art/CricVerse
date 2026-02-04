const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Security Guard
const crypto = require('crypto'); // Transaction ID generate karne ke liye

const router = express.Router();

// @route   GET /api/payment/balance
// @desc    Get current wallet balance & history
router.get('/balance', protect, async (req, res) => {
    try {
        // User is already attached to req by 'protect' middleware
        // But we fetch again to be safe and get latest balance
        const user = await User.findById(req.user.id).select('wallet');
        
        res.status(200).json({
            success: true,
            balance: user.wallet.balance,
            currency: user.wallet.currency
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/payment/deposit
// @desc    Add Fake Money (Simulating UPI/Bank)
router.post('/deposit', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = req.user;

        // 1. Validation
        if (amount < 1 || amount > 10000) {
            return res.status(400).json({ success: false, message: 'Amount must be between ₹1 and ₹10,000' });
        }

        // 2. Simulate Payment Gateway Delay (2 seconds)
        // Real life mein yahan Razorpay ka webhook verify hota hai
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Update Balance
        user.wallet.balance += parseFloat(amount);
        
        // 4. Generate Transaction ID
        const txnId = 'TXN_' + crypto.randomBytes(4).toString('hex').toUpperCase();

        // Note: Real apps mein ek alag 'Transaction' collection hoti hai history ke liye.
        // Abhi ke liye hum balance update kar rahe hain aur success bhej rahe hain.
        
        await user.save();

        res.status(200).json({
            success: true,
            newBalance: user.wallet.balance,
            txnId,
            message: `Successfully added ₹${amount}`
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Transaction Failed' });
    }
});

// @route   POST /api/payment/withdraw
// @desc    Withdraw Money (Only if verified)
router.post('/withdraw', protect, async (req, res) => {
    try {
        const { amount, upiId } = req.body;
        const user = req.user;

        // 1. Basic Checks
        if (amount <= 0) return res.status(400).json({ success: false, message: 'Invalid Amount' });
        if (user.wallet.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient Funds' });

        // 2. KYC Check (Pro Feature)
        if (!user.wallet.isKyVerified) {
            return res.status(403).json({ success: false, message: 'KYC Verification Required for Withdrawals' });
        }

        // 3. Deduct Balance
        user.wallet.balance -= parseFloat(amount);
        await user.save();

        res.status(200).json({
            success: true,
            newBalance: user.wallet.balance,
            message: `Withdrawal request of ₹${amount} sent to ${upiId}`
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Withdrawal Failed' });
    }
});

module.exports = router;
