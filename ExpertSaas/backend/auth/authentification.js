const express = require('express');
const jwt = require('jsonwebtoken');
const Expert = require('../models/Expert');
const Token = require('../models/Token');
const router = express.Router();
const { checkTokenExists } = require('../middleware/authMiddleware');

const generateAuthToken = async (expert) => {
    const jwtExpiresIn = 60 * 60 * 24; // 24 hours
    const token = jwt.sign(
        {
            expertId: expert.id,
            email: expert.email,
            firstname: expert.firstname,
            lastname: expert.lastname,
            picture: expert.picture
        },
        process.env.SECRET_KEY,
        { expiresIn: jwtExpiresIn }
    );

    // Delete any existing token for this expert
    await Token.destroy({
        where: { expertId: expert.id }
    });

    // Create new token
    await Token.create({
        expertId: expert.id,
        token: token,
        expiresAt: new Date(Date.now() + jwtExpiresIn * 1000)
    });

    return { token, expiresIn: jwtExpiresIn };
};

// Google authentication - Simplified version without token verification
router.post('/google-auth', async (req, res) => {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');

    try {
        const { userInfo } = req.body;

        if (!userInfo || !userInfo.email) {
            return res.status(400).json({ message: 'No user info provided' });
        }

        console.log('Received user info:', userInfo.email);

        const { email, given_name, family_name, picture } = userInfo;

        // Check if expert already exists
        let expert = await Expert.findOne({
            where: { email }
        });

        // If expert doesn't exist, create one
        if (!expert) {
            expert = await Expert.create({
                firstname: given_name || '',
                lastname: family_name || '',
                email: email,
                picture: picture || '',
                isGoogleAuth: true,
                isActive: true
            });
            console.log('Created new expert:', expert.email);
        } else {
            console.log('Existing expert found:', expert.email);
        }

        // Generate JWT token
        const { token, expiresIn } = await generateAuthToken(expert);

        res.json({
            message: 'Authentication successful',
            token,
            expiresIn,
            expert: {
                id: expert.id,
                firstname: expert.firstname,
                lastname: expert.lastname,
                email: expert.email,
                picture: expert.picture,
                isActive: expert.isActive
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ message: 'Authentication failed: ' + error.message });
    }
});

// OPTIONS handler for preflight
router.options('/google-auth', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Check if token is valid/expired
router.post("/check-token", async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');

    try {
        const { token } = req.body;

        if (!token) {
            return res.json({
                valid: false,
                message: 'No token provided'
            });
        }

        const tokenRecord = await Token.findOne({
            where: { token },
            include: [{
                model: Expert,
                attributes: ['id', 'firstname', 'lastname', 'email', 'picture', 'isActive']
            }]
        });

        if (!tokenRecord) {
            return res.json({
                valid: false,
                message: 'Token not found'
            });
        }

        // Check if token is expired
        const now = new Date();
        const expired = now > new Date(tokenRecord.expiresAt);

        if (expired) {
            await tokenRecord.destroy();
            return res.json({
                valid: false,
                message: 'Token has expired'
            });
        }

        // Verify JWT
        try {
            jwt.verify(token, process.env.SECRET_KEY);
        } catch (jwtError) {
            await tokenRecord.destroy();
            return res.json({
                valid: false,
                message: 'Invalid token'
            });
        }

        res.json({
            valid: true,
            expert: tokenRecord.Expert,
            expiresAt: tokenRecord.expiresAt
        });
    } catch (error) {
        console.error('Token check error:', error);
        res.status(500).json({ message: 'Error checking token' });
    }
});

// Logout
router.post('/logout', checkTokenExists, async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');

    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            await Token.destroy({
                where: { token }
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
});

module.exports = router;