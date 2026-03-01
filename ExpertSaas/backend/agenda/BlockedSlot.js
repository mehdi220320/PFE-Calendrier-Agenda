const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BlockedSlot = sequelize.define("BlockedSlot", {
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
    startDayDate:{type : DataTypes.DATE, allowNull:false},
    endDayDate:{type : DataTypes.DATE,allowNull:false},
    startDateTime: {type : DataTypes.TIME, allowNull:false},
    endDateTime: {type : DataTypes.TIME, allowNull:false},
    reason:{type:DataTypes.STRING, allowNull:true},
});

module.exports = BlockedSlot;