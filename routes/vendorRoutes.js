const express = require('express');
const {
    getVendors,
    getVendor,
    createVendor,
    updateVendor,
    deleteVendor
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all vendor routes
router.use(protect);

router
    .route('/')
    .get(getVendors)
    .post(authorize('Admin', 'Manager', 'Procurement Officer', 'Vendor'), createVendor);

router
    .route('/:id')
    .get(getVendor)
    .put(authorize('Admin', 'Manager', 'Procurement Officer'), updateVendor)
    .delete(authorize('Admin'), deleteVendor);

module.exports = router;
