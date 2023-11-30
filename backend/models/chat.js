const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    users: { type: [{ type: Schema.Types.ObjectId, ref: "User" }] },
    messages: { type: [{ type: Schema.Types.ObjectId, ref: "Message" }] },
});

module.exports = mongoose.model("Chat", ChatSchema);