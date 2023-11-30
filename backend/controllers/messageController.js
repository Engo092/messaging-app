const Message = require('../models/message');
const Chat = require('../models/chat');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.message_submit_post = [
    body("message", "please provide a message").trim().isLength({ min: 1 }).escape(),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            const message = new Message({ 
                user: req.user._id,
                text: req.body.message,
            });
            await message.save();
            await Chat.findOneAndUpdate({users: { $all: [req.user._id, req.body.friend_id] }}, { $push: { messages: message } }).exec();
            res.json({status: "message submitted"});
        }
    })
];