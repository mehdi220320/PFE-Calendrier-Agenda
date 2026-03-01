const User = require("./User");
const Token = require("./Token");
const WorkingHours = require("../agenda/WorkingHours");
const BlockedSlot = require("../agenda/BlockedSlot");
const Break = require("../agenda/Break");


User.hasOne(Token, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Token.belongsTo(User, {
    foreignKey: "userId",
});

User.hasOne(WorkingHours,{
    foreignKey: "userId",
    onDelete: "CASCADE",
});
WorkingHours.belongsTo(User, {
    foreignKey: "userId",
});

User.hasOne(Break,{
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Break.belongsTo(User, {
    foreignKey: "userId",
});

User.hasMany(BlockedSlot, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
BlockedSlot.belongsTo(User, {
    foreignKey: "userId",
});