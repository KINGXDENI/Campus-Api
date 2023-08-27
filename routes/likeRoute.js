const express = require('express');
const likeControllers = require('../controllers/likeController.js');
const router = express.Router();

router.post('/add-like/:id', likeControllers.addLike);

router.get('/get-likes/:id', likeControllers.getLikesByReportId);

router.delete('/remove-like/:id', likeControllers.removeLike);

module.exports = router;
