const User = require('../models/user');
const Chat = require('../models/chat');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');


exports.user_index_get = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        const friends = await getFriendsInfo(req.user);
        res.json({
            isAuthenticated: true,
            user: req.user,
            friends: friends,
        });    
    }
});

exports.user_signup_get = asyncHandler(async (req, res, next) => {
    // clears any login error messages
    if (req.session.messages) {
        req.session.messages = null;
    }
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        res.json({
            isAuthenticated: true,
        });
    }
});

exports.user_signup_post = [
    // validate and sanitize fields
    body("username", "username must not be empty").trim().isLength({ min: 1 }).escape(),
    body("password", "please provide a valid password").trim().isLength({ min: 6 }).escape(),
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("email must be specified")
        .isEmail()
        .withMessage("please provide a valid email")
        .custom(async value => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error("email already in use");
            }
        })
        .escape(),

    async (req, res, next) => {
        try {
            bcrypt.hash(req.body.password, 10 , async (err, hashedPassword) => {
                if (err) {
                    return next(err);
                } else {
                    const errors = validationResult(req);

                    const user = new User({
                        username: req.body.username,
                        password: hashedPassword,
                        email: req.body.email,
                    });

                    if (!errors.isEmpty()) {
                        res.json({ errors: errors.array() });
                        return;
                    } else {
                        await user.save();
                        res.json({ message: "signup OK, please log in now" });
                    }
                }
            });
        } catch(err) {
            return next(err);
        }
    }
];

exports.user_login_get = asyncHandler(async (req, res, next) => {
    // clears any login error messages
    if (req.session.messages) {
        req.session.messages = null;
    }
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        res.json({
            isAuthenticated: true,
        });
    }
});

exports.user_login_post = [
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("email must be specified")
        .isEmail()
        .withMessage("please provide a valid email")
        .escape(),
    body("password", "please provide a valid password (minimum: 6 characters)").trim().isLength({ min: 6 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            // clears any previous login error messages
            if (req.session.messages) {
                req.session.messages = null;
            }
            
            passport.authenticate("local", {
                successRedirect: "/api/login/success",
                failureRedirect: "/api/login/failure",
                failureMessage: true,
            })(req, res, next);
        }
    })
];

exports.user_login_success = asyncHandler(async (req, res, next) => {
    if (req.user) {
        res.json({ message: "login OK", account: `logged in as ${req.user.username}` });
    } else {
        res.redirect("/api/login");
    }
});

exports.user_login_failure = asyncHandler(async (req, res, next) => {
    res.json(req.session);
});

exports.user_logout_get = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
    });
    res.json({message: "logged out"});
});

exports.status_edit_post = [
    body("status", "please provide a valid status (max: 20 characters)").trim().isLength({ max: 20 }).escape(),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            await User.findByIdAndUpdate(req.user._id, {status: req.body.status}).exec();
            res.json({message: "status updated"});
        }
    })
];

exports.user_search_post = asyncHandler(async (req, res, next) => {
    const friendUser = await User.findOne({ email: req.body.email }).exec();

    if (friendUser && friendUser._id !== req.user._id) {
        const user = await User.findById(req.user._id);
        let hasFriendAlready = false;
        user.friends.forEach((friend) => {
            if (friend.equals(friendUser._id)) {
                hasFriendAlready = true;
            }
        });
        if (hasFriendAlready) {
            res.json({ message: "Friend already added"});
        } else {
            await User.findByIdAndUpdate(user._id, { $push: { friends: friendUser }});
            await User.findByIdAndUpdate(friendUser._id, { $push: { friends: user }});
            const chat = new Chat({
                users: [user._id, friendUser._id],
            });
            await chat.save();
            res.json({ message: "User found" });
        }
    } else {
        res.json({ message: "User not found" });
    }
});

exports.user_friend_post = asyncHandler(async (req, res, next) => {
    const friendId = new mongoose.Types.ObjectId(req.body.friend_id);
    const friend = await User.findById(friendId, {password: 0, friends: 0, _id: 0}).exec();

    res.json({ friend: friend });
});


const getFriendsInfo = async (user) => {
    const friends = [];
    for (const friend of user.friends) {
        const friendInfo = await User.findById(friend, {password: 0, friends: 0}).exec();
        friends.push(friendInfo);
    }
    return friends;
}