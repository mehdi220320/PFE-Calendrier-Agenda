const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Meeting = sequelize.define("Meeting", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    summary:{type:DataTypes.STRING, allowNull:true},
    creator: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
    },
    expert:{
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        Validator:{
            isValidDayArray(value) {
                    if(!(value.toUpperCase()!=="EXPERT")){
                    console.log("The user isn't an expert");
                    return false;
                }else{
                        return true;
                    }
            }
        }
    },
    description:{type:DataTypes.STRING, allowNull:true},
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isFuture(value) {
                if (new Date(value) < new Date()) {
                    throw new Error('Meeting date must be in the future');
                }
            }
        }
    },
    slotDuration:{type:DataTypes.INTEGER, defaultValue:15,allowNull:false},
    meetUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    jitsiRoom:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }

});

module.exports = Meeting;