const express = require('express');
const { getQuotations, submitQuotation, updateQuotationStatus } = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getQuotations)
    .post(submitQuotation);

router
    .route('/:id/status')
    .put(updateQuotationStatus);

module.exports = router;
