const RFQ = require('../models/RFQ');
const Activity = require('../models/Activity');

// @desc    Get all RFQs
// @route   GET /api/rfqs
// @access  Private
exports.getRFQs = async (req, res) => {
    try {
        const rfqs = await RFQ.find().sort('-createdAt').populate('createdBy', 'name');
        res.status(200).json({ success: true, count: rfqs.length, data: rfqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new RFQ
// @route   POST /api/rfqs
// @access  Private (Admin, Manager, Procurement Officer)
exports.createRFQ = async (req, res) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        const rfq = await RFQ.create(req.body);

        // Log Activity
        await Activity.create({
            action: 'RFQ Created',
            details: `A new RFQ "${rfq.title}" was created`,
            user: req.user.id
        });

        res.status(201).json({ success: true, data: rfq });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
