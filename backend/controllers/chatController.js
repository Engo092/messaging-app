const Chat = require('../models/chat');

const asyncHandler = require('express-async-handler');

exports.chat_list_messages_post = asyncHandler(async (req, res, next) => {
    const chat = await Chat.findOne({ users: { $all: [req.user._id, req.body.friend_id] } })
        .populate({path: "messages", options: {sort: {"_id": -1}}}).exec();
    res.json({
        messages: chat.messages,
    });    
});