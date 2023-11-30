const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const chat_controller = require('../controllers/chatController');
const message_controller = require('../controllers/messageController');

router.get('/', user_controller.user_index_get);

router.get('/signup', user_controller.user_signup_get);

router.post('/signup', user_controller.user_signup_post);

router.get('/login', user_controller.user_login_get);

router.post('/login', user_controller.user_login_post);

router.get('/login/success', user_controller.user_login_success);

router.get('/login/failure', user_controller.user_login_failure);

router.get('/logout', user_controller.user_logout_get);

router.post('/status', user_controller.status_edit_post);

router.post('/search', user_controller.user_search_post);

router.post('/friend', user_controller.user_friend_post);

router.post('/chat', chat_controller.chat_list_messages_post);

router.post('/message', message_controller.message_submit_post);

module.exports = router;
