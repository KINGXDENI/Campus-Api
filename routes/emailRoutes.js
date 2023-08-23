const express = require('express');
const {
    sendEmail
} = require('../controllers/emailController');
const router = express.Router();

// Definisikan rute untuk mengirim email
router.post('/send-email', sendEmail);

module.exports = router;
