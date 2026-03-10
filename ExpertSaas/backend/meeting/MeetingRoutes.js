const express = require('express');
const router = express.Router();
const Meeting=require('./Meeting')
const User = require("../models/User");
const nodemailer = require('nodemailer');

async function sendMeetingCreationEmail(userEmail, description) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"E-Tafakna Agenda" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: '📅 Nouvelle réunion créée - À vérifier',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #2c3e50; margin-bottom: 5px;">E-Tafakna Agenda</h1>
                    <p style="color: #7f8c8d; font-size: 16px;">Nouvelle réunion créée</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="font-size: 16px; color: #34495e; margin: 0 0 15px 0;">
                        Bonjour,
                    </p>
                    <p style="font-size: 16px; color: #34495e; margin: 0 0 15px 0;">
                        Une nouvelle réunion a été créée et nécessite votre attention.
                    </p>
                    
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                        <p style="margin: 0; color: #2c3e50;">
                            <strong>Description de la réunion :</strong>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #34495e; font-style: italic;">
                            "${description}"
                        </p>
                    </div>
                    
                    <p style="font-size: 16px; color: #34495e; margin: 15px 0 0 0;">
                        Veuillez vérifier les détails et confirmer votre disponibilité dès que possible.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Voir la réunion
                    </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #7f8c8d; text-align: center;">
                    <p>Ceci est un message automatique de E-Tafakna Agenda. Merci de ne pas répondre à cet email.</p>
                    <p>© 2024 E-Tafakna Agenda. Tous droits réservés.</p>
                </div>
            </div>
        `,
        text: `Bonjour,\n\nUne nouvelle réunion a été créée et nécessite votre attention.\n\nDescription de la réunion : "${description}"\n\nVeuillez vérifier les détails et confirmer votre disponibilité dès que possible.\n\n---\nCeci est un message automatique de E-Tafakna Agenda.`
    };

    await transporter.sendMail(mailOptions);
}

router.get('/all',async(req,res)=>{
    try {
        const meets=await Meeting.findAll();
        res.status(200).send({meetings:meets,message:"All meets "});
    }catch (e) {
        res.status(404).send('Not Found meetings : '+e.message);
    }
})

router.post('/add',async (req,res)=>{
    try {
        const {creator,summary,expertId,description,date,slotDuration}=req.body;

        const expert = await User.findOne({
            where: {
                id: expertId,
                role: "expert"
            }
        });
        if(!expertId){
            res.status(400).send({ message: "Expert not found" });
        }
        const meet=await Meeting.create({creator:creator, summary:summary, expert:expert.id, description:description, date:date, slotDuration:slotDuration});
        sendMeetingCreationEmail(creator,description);
        sendMeetingCreationEmail(expert.email,description);
        res.status(200).send({meet:meet,message:'The meeting is created succefully' });

    }catch (e) {
        res.status(404).send(e.message);
    }
});

router.get('meet/:id',async(req,res)=>{
    try {
        const meet=await Meeting.findByPk(req.params.id);
        if(!meet){
            res.status(404).send({ message: "Meeting not found" });
        };
        res.status(200).send({meeting:meet});
    }catch (e) {
        res.status(404).send(e.message);
    }
})



//
//
// // Update meeting
// router.put('/update/:id', async (req, res) => {
//     try {
//         const meeting = await Meeting.findByPk(req.params.id);
//         if (!meeting) {
//             return res.status(404).send({ message: "Meeting not found" });
//         }
//
//         await meeting.update(req.body);
//         res.status(200).send({ meeting, message: "Meeting updated successfully" });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
//
// // Delete meeting
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const meeting = await Meeting.findByPk(req.params.id);
//         if (!meeting) {
//             return res.status(404).send({ message: "Meeting not found" });
//         }
//
//         await meeting.destroy();
//         res.status(200).send({ message: "Meeting deleted successfully" });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
//
// // Get meetings by expert
// router.get('/expert/:expertId', async (req, res) => {
//     try {
//         const meetings = await Meeting.findAll({
//             where: { expert: req.params.expertId },
//             order: [['date', 'DESC']]
//         });
//         res.status(200).send({ meetings });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
//
// // Get meetings by creator
// router.get('/creator/:creatorEmail', async (req, res) => {
//     try {
//         const meetings = await Meeting.findAll({
//             where: { creator: req.params.creatorEmail },
//             order: [['date', 'DESC']]
//         });
//         res.status(200).send({ meetings });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
//
// // Get meetings by date range
// router.get('/range', async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;
//         const meetings = await Meeting.findAll({
//             where: {
//                 date: {
//                     [Op.between]: [new Date(startDate), new Date(endDate)]
//                 }
//             },
//             order: [['date', 'ASC']]
//         });
//         res.status(200).send({ meetings });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
//
// // Update meeting status
// router.patch('/status/:id', async (req, res) => {
//     try {
//         const { status } = req.body;
//         const meeting = await Meeting.findByPk(req.params.id);
//
//         if (!meeting) {
//             return res.status(404).send({ message: "Meeting not found" });
//         }
//
//         meeting.status = status;
//         await meeting.save();
//
//         res.status(200).send({ meeting, message: `Meeting status updated to ${status}` });
//     } catch (e) {
//         res.status(400).send(e.message);
//     }
// });
module.exports = router;
