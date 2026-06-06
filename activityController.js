const Activity = require('../models/Activity');

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.find().sort('-createdAt').limit(10).populate('user', 'name role');
        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
