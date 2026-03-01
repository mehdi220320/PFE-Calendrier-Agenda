const express = require("express");
const router = express.Router();
const User=require("../models/User");
const WorkingHours=require("./WorkingHours");
const BlockedSlot=require("./BlockedSlot");
const Break=require("./Break");
require('dotenv').config();
const { authentication } = require('../middleware/authMiddleware');

router.use(authentication);

router.post("/addWorkingHours", async (req, res) => {
    try {

        const {dayOfWeek, startTime, endTime, slotDuration } = req.body;
        const userId=req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        const workingHoursExist = await WorkingHours.findOne({
            where: { userId: userId }
        });

        if (workingHoursExist) {
            return res.status(400).send({ message: 'WorkingHours already exists' }); // Correction: 400 au lieu de 404
        }

        const newWorkingHours = await WorkingHours.create({ userId, dayOfWeek, startTime, endTime, slotDuration });

        res.status(201).send({
            message: "WorkingHours registered successfully",
            WorkingHours: newWorkingHours
        });
    }
    catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.patch("/updateWorkingHours", async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { userId: req.user.userId }
        });

        if (!workingHours) {
            return res.status(404).send({ message: 'WorkingHours not found' });
        }

        const { dayOfWeek, startTime, endTime, slotDuration } = req.body;
        const newWorkingHours = await workingHours.update({ dayOfWeek, startTime, endTime, slotDuration });

        res.status(200).send({
            message: 'WorkingHours updated successfully',
            newworkingHours: newWorkingHours
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.get('/WorkingHours', async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { userId: req.user.userId }
        });

        if (!workingHours) {
            return res.status(404).send({ message: 'WorkingHours not found' });
        }

        res.status(200).send({ workingHours }); // Correction: 200 au lieu de 201
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.post("/addBlockedSlot", async (req, res) => {
    try {
        const {  startDayDate, endDayDate, startDateTime, endDateTime, slotDuration, reason } = req.body;
        const userId=req.user.userId
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const newBlockedSlot = await BlockedSlot.create({
            userId,
            startDayDate,
            endDayDate,
            startDateTime,
            endDateTime,
            slotDuration,
            reason
        });

        res.status(201).send({
            message: "BlockedSlot registered successfully",
            BlockedSlot: newBlockedSlot
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.post("/addBreak", async (req, res) => {
    try {
        const {  startAt, endAt} = req.body;
        const userId=req.user.userId
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const newBreak = await Break.create({
            userId,startAt, endAt
        });

        res.status(201).send({
            message: "Break registered successfully",
            BlockedSlot: newBreak
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});
router.patch("/updateBreak", async (req, res) => {
    try {
        const bbreak= await Break.findOne({
            where: { userId: req.user.userId }
        });

        if (!bbreak) {
            return res.status(404).send({ message: 'Break not found' });
        }

        const { startAt,endAt } = req.body;
        const newBreak = await bbreak.update({startAt,endAt });

        res.status(200).send({
            message: 'Break updated successfully',
            newBreak: newBreak
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});
router.delete("/deleteBreak", async (req, res) => {
    try {
        const bbreak= await Break.findOne({
            where: { userId: req.user.userId }
        });

        if (!bbreak) {
            return res.status(404).send({ message: 'Break not found' });
        }

       bbreak.destroy();

        res.status(200).send({
            message: 'Break deleted successfully',
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});
router.get("/Break", async (req, res) => {
    try {
        const bbreak= await Break.findOne({
            where: { userId: req.user.userId }
        });

        res.status(200).send({
            bbreak
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});



router.get("/allBlockedSlot", async (req, res) => {
    try {
        const blockedSlot = await BlockedSlot.findAll({
            where: { userId: req.user.userId }
        });

        res.status(200).send({ blockedSlot });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.get("/checkWorkingHoursExists", async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { userId: req.user.userId }
        });

        if (workingHours) {
            res.status(200).send({ message: 'WorkingHours already exists', result: true });
        } else {
            res.status(200).send({ message: 'WorkingHours not found', result: false });
        }
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.delete("/deleteBlockedSlot", async (req, res) => {
    try {
        const { blockedSlotId } = req.body;
        const blockedSlot = await BlockedSlot.findByPk(blockedSlotId);

        if (!blockedSlot) {
            return res.status(404).send({ message: 'BlockedSlot not found' });
        }

        await blockedSlot.destroy();
        res.status(200).send({ message: 'BlockedSlot deleted successfully' });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
});

router.get("/disponibility",async(req,res)=>{
    try {
        const userId=req.user.userId;
        const blockedSlots = await BlockedSlot.findAll({
            where: { userId: userId }
        });
        const workinghours= await WorkingHours.findOne({
            where:{userId:userId}
        });
        const bbreak= await Break.findOne({
            where:{userId:userId}
        });
        res.status(200).send({
            blockSlots: blockedSlots,
            workinghours: workinghours,
            break: bbreak
        });
    } catch (e) {
        res.status(400).send({ message: e.message });
    }
})


module.exports = router;