const express = require('express');
const {
    sendEmail, sendEmailUser, sendEmailUseru
} = require('../controllers/emailController');
const router = express.Router();

// Definisikan rute untuk mengirim email
router.post('/send-email', sendEmail);
router.post('/send-email-user', sendEmailUser);
router.post('/send-email-useru', sendEmailUseru);

module.exports = router;
