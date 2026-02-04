const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Check if Authorization header exists and starts with Bearer
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // 2. Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        // 3. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach User to Request (so we know WHO is playing)
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next(); // Gate opens, proceed to logic
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
};
