const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getActivities);

module.exports = router;
