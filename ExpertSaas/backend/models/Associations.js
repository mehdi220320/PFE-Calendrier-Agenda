const Expert = require("./Expert");
const Token = require("./Token");

Expert.hasOne(Token, {
    foreignKey: "expertId",
    onDelete: "CASCADE",
});
Token.belongsTo(Expert, {
    foreignKey: "expertId",
});