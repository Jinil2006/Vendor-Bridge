const express = require('express');
const { getRFQs, createRFQ } = require('../controllers/rfqController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getRFQs)
    .post(authorize('Admin', 'Manager', 'Procurement Officer', 'Vendor'), createRFQ);

module.exports = router;
