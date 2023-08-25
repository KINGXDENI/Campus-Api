const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const multer = require('multer');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profilePictures'); // Uploads directory where images will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

// Set up Multer upload middleware
const upload = multer({
    storage: storage
});

router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get('/users/:userIdornim', UserController.getUser);
router.post('/users', upload.single('profilePicture'), UserController.createUser);
router.get('/users', UserController.getUsers);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

module.exports = router;