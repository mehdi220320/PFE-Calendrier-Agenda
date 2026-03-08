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
        type: DataTypes.STRING,
        allowNull: false,
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
    date: {type : DataTypes.DATE, allowNull:false},
    slotDuration:{type:DataTypes.INTEGER, defaultValue:15,allowNull:false},

});

module.exports = Meeting;