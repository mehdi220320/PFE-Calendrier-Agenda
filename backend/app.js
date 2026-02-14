const express = require("express");
const app = express();
const twilio = require("twilio");
const cors=require("cors");
require("dotenv").config();
// const sequelize = require("./config/db");
// const User =require("./models/user");
// (async () => {
//     try {
//         await sequelize.sync({ alter: true });
//         console.log("All tables are created ✅");
//     } catch (err) {
//         console.error("Error creating tables ❌", err);
//     }
// })();
// app.get("/", (req, res) => {
//     const users= User.find({});
//     res.send(users)
// })
// app.post("/login", async (req, res) => {
//     try{
//         await User.create({
//             firstname: "Med",
//             secondname: "Mehdi",
//             email: "med2@mail.com",
//             password: "123",
//         });
//         console.log(user);
//         res.send({message:"great"})
//     }catch (e) {
//         res.send({message:"te7cha  "+e})
//
//     }
//
// })
app.use(cors({
    origin: ['http://localhost:5173'], // Allow these origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

}))

app.get("/token",(req,res)=>{
    const accountSid = process.env.accountSid;
    const apiKeySid = process.env.apiKeySid;
    const apiKeySecret = process.env.apiKeySecret;

    const { AccessToken } = twilio.jwt;
    const { VideoGrant } = AccessToken;

    const identity = "medmehdi";
    const roomName = "test-room";

    const token = new AccessToken(
        accountSid,
        apiKeySid,
        apiKeySecret,
        { identity: "medmehdi", ttl: 3600 } // 1 hour
    );
    token.addGrant(new VideoGrant({ room: roomName }));
    res.send(token.toJwt())
})

app.listen(process.env.Port, () => {
    console.log("Server started on port "+process.env.Port);
});