const express = require('express');
const {
    sendEmail, sendEmailUser
} = require('../controllers/emailController');
const router = express.Router();

// Definisikan rute untuk mengirim email
router.post('/send-email', sendEmail);
router.post('/send-email-user', sendEmailUser);

module.exports = router;
