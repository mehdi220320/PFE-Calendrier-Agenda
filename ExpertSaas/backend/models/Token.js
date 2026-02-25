const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Token = sequelize.define("Token", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
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
            fields: ['userId']
        }
    ]
});

module.exports = Token;