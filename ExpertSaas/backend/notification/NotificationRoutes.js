const express = require('express');
const router = express.Router();
const NotificationService = require("./NotificationService");
const Notification=require("./Notification");
const Meeting=require('../meeting/Meeting');
require('../models/associations');

const { googleAuth } = require('../middleware/authMiddleware');
const {fn, col} = require("sequelize");
const User = require("../models/User");

router.get("/", googleAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationService.getNotificationsForUser(userId);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/read/:id", googleAuth, async (req, res) => {
    try {
        const id = req.params.id;
        let notification = await Notification.findByPk(id);
        if (!notification) {
            res.status(401).json({ error: 'Notify not found' });
        }
        notification.read=true;
        await notification.save();

        res.status(201).json({message:"mark as seen succefully"});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;