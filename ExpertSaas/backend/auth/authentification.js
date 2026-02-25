const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require("sequelize");

const generateResetCode = () => {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const generateAuthToken = async (user) => {
    const jwtExpiresIn = 60 * 60 * 24;

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            picture: user.picture
        },
        process.env.SECRET_KEY,
        { expiresIn: jwtExpiresIn }
    );

    await Token.create({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + jwtExpiresIn * 1000)
    });

    return { token, expiresIn: jwtExpiresIn };
};
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const resetCode = generateResetCode();
        const resetCodeExpires = new Date(Date.now() + 2 * 60 * 1000);

        await user.update({
            resetPasswordToken: resetCode,
            resetPasswordExpires: resetCodeExpires
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Password Reset Code',
            text: `Your reset code: ${resetCode}`
        });

        res.status(200).send({ message: 'Reset code sent' });

    } catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Error sending reset code' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({
            where: {
                email,
                resetPasswordToken: code,
                resetPasswordExpires: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).send({ message: 'Invalid or expired reset code' });
        }

        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        res.status(200).send({ message: 'Password reset successfully' });

    } catch (e) {
        res.status(500).send({ message: 'Error resetting password' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        console.log({email, password})
        const user = await User.findOne({where: {email}});

        if (!user) {
            return res.status(404).send({message: 'User not found'});
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(400).send({message: 'Invalid credentials'});
        }

        const {token, expiresIn} = await generateAuthToken(user);

        res.send({
            message: user.role + ' logged in successfully',
            token,
            expiresIn,
            role: user.role,
            isActive: user.isActive
        });

    } catch (e) {
        res.status(500).send({message: e.message});
    }
});

module.exports = router;