const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const authRouter = require('./auth/authentification');
const calandarRouter = require('./calendar/calendarrouter');
const userRouter = require('./users/userroutes');
const session = require("express-session");
const User =require('./models/User.js')
const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use('/api/auth', authRouter);
// app.use('/api/calendar', calandarRouter);
app.use('/api/users', userRouter);



sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully');
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

async function createAdmin() {
    try {
        const {firstname, lastname, role, email, password} = {
            id:0,
            firstname: "med",
            lastname: "mehdi",
            role: "user",
            email: "medmehdi1920@gmail.com",
            password: "admin123*"
        };

        const existingUser = await User.findOne({where: {email}});

        if (existingUser) {
            return "User already exists";
        }

        const user = await User.create({
            firstname,
            lastname,
            email,
            password,
            role
        });

        return {
            message: "User registered successfully",
            user
        };

    } catch (e) {
       return e.message;
    }

};

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    const msg=await createAdmin()

    console.log(msg)
});