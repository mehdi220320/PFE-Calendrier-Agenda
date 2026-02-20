const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Token = sequelize.define("Token", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    expertId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Experts',
            key: 'id'
        }
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['token']
        },
        {
            fields: ['expertId']
        }
    ]
});

module.exports = Token;