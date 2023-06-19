const express = require('express');
const { addLike, getLikesByReportId } = require('../controllers/likeController.js');
const router = express.Router();

// Definisikan rute untuk menambahkan like
router.post('/reports/:id/like', addLike);
router.get('/reports/:id/like', getLikesByReportId);

module.exports = router;
