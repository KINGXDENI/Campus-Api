const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.post('/login', UserController.login);
router.post('/register', UserController.register);
router.get('/users/:userIdornim', UserController.getUser);
router.post('/users', UserController.createUser);
router.get('/users', UserController.getUsers);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);
router.put('/changeProfilePicture/:id', UserController.changeProfilePicture);
router.post('/change-password/:id', UserController.changePassword);
router.post('/change-password-wo/:id', UserController.changePasswordWithoutOld);

module.exports = router;
