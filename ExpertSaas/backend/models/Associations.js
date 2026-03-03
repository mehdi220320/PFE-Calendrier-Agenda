const User = require("./User");
const Token = require("./Token");
const Availability = require("../agenda/Availability");
const AvailabilityOverride = require("../agenda/AvailabilityOverride");
const BlockedSlot = require("../agenda/BlockedSlot");
const Break = require("../agenda/Break");


User.hasOne(Token, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Token.belongsTo(User, {
    foreignKey: "userId",
});

User.hasOne(Availability,{
    foreignKey: "userId",
    onDelete: "CASCADE",
});
Availability.belongsTo(User, {
    foreignKey: "userId",
});

User.hasOne(AvailabilityOverride,{
    foreignKey: "userId",
    onDelete: "CASCADE",
});
AvailabilityOverride.belongsTo(User, {
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