const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Document = sequelize.define("Document", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    sender: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    receiver: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    sharedWith: {
        type: DataTypes.JSON,
        allowNull: true,
        // references: {
        //     model: 'Users',
        //     key: 'id'
        // },
        defaultValue: [],
    },
    files: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'received', 'viewed'),
        defaultValue: 'pending',
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Documents',
    timestamps: true
});

module.exports = Document;