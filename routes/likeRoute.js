const express = require('express');
const { addLike, getLikesByReportId } = require('../controllers/likeController.js');
const router = express.Router();

// Definisikan rute untuk menambahkan like
router.post('/report/:id/like', addLike);
router.get('/report/:id/like', getLikesByReportId);

module.exports = router;
