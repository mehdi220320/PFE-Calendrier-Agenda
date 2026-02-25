const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Token = require('../models/Token');


const authentication = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ error: "Not authorized. No token." });
        }

        const token = authHeader.replace("Bearer ", "");

        const existingToken = await Token.findOne({
            where: {
                token,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!existingToken) {
            return res.status(401).send({ error: "Token expired or not recognized." });
        }


        req.user = await jwt.verify(token, process.env.SECRET_KEY);

        next();

    } catch (err) {
        return res.status(401).send({ error: "Invalid or expired token." });
    }
};

const adminAuthorization = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ error: "Not authorized. No token." });
        }

        const token = authHeader.replace("Bearer ", "");

        const existingToken = await Token.findOne({
            where: {
                token,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!existingToken) {
            return res.status(401).send({ error: "Token expired or not recognized." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if (decoded.role !== "admin") {
            return res.status(403).send({ error: "Admins only." });
        }

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).send({ error: "Invalid or expired token." });
    }
};

const checkTokenExists = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).send({ error: "No token provided." });
        }

        const token = authHeader.replace("Bearer ", "");

        const existing = await Token.findOne({
            where: {
                token,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!existing) {
            return res.status(401).send({ error: "Token not recognized or expired." });
        }

        next();

    } catch (err) {
        return res.status(500).send({ error: "Server error." });
    }
};

module.exports = {
    authentication,
    adminAuthorization,
    checkTokenExists
};