const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const { Op } = require('sequelize');

const checkTokenExists = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify JWT
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Check if token exists in database and is not expired
        const tokenRecord = await Token.findOne({
            where: {
                token: token,
                expertId: decoded.expertId,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!tokenRecord) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        // Add expert info to request
        req.expertId = decoded.expertId;
        req.expertEmail = decoded.email;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired'
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            message: 'Authentication error'
        });
    }
};

module.exports = {
    checkTokenExists
};