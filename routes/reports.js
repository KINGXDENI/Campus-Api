const express = require('express');
const router = express.Router();
const {
    getReports,
    getReportById,
    saveReport,
    updateReport,
    deleteReport
} = require('../controllers/report');

// GET /reports
router.get('/report', getReports);

// GET /reports/:id
router.get('/report/:id', getReportById);

// POST /reports
router.post('/report', saveReport);

// PUT /reports/:id
router.put('/report/:id', updateReport);

// DELETE /reports/:id
router.delete('/:id', deleteReport);

module.exports = router;
