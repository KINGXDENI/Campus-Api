const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
    try {
        const {
            recipient,
            subject,
            message
        } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME, // Ganti dengan email pengirim
                pass: process.env.EMAIL_PASSWORD, // Ganti dengan password email pengirim
            },
        });

        const mailOptions = {
            from: 'Campus Report <' + process.env.EMAIL_USERNAME + '>',
            to: recipient,
            subject: subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Email sent successfully.'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'An error occurred while sending the email.'
        });
    }
};

const sendEmailUser = async (req, res) => {
    try {
        const {
            recipient,
            subject,
            message
        } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME, // Ganti dengan email pengirim
                pass: process.env.EMAIL_PASSWORD, // Ganti dengan password email pengirim
            },
        });

        const mailOptions = {
            from: 'New Report <' + process.env.EMAIL_USERNAME + '>',
            to: recipient,
            subject: subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            message: 'Email sent successfully.'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'An error occurred while sending the email.'
        });
    }
};

module.exports = {
    sendEmail, sendEmailUser
};
