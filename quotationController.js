const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const Activity = require('../models/Activity');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find()
            .populate('rfq', 'title status')
            .populate('vendor', 'name')
            .populate('submittedBy', 'name')
            .sort('-createdAt');
            
        res.status(200).json({ success: true, count: quotations.length, data: quotations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit a new quotation
// @route   POST /api/quotations
// @access  Private
exports.submitQuotation = async (req, res) => {
    try {
        req.body.submittedBy = req.user.id;
        
        // Ensure RFQ exists
        const rfq = await RFQ.findById(req.body.rfq);
        if (!rfq) {
            return res.status(404).json({ success: false, message: 'RFQ not found' });
        }

        const quotation = await Quotation.create(req.body);

        // Log Activity
        await Activity.create({
            action: 'Quotation Submitted',
            details: `A quotation for RFQ "${rfq.title}" was submitted`,
            user: req.user.id
        });

        res.status(201).json({ success: true, data: quotation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update quotation status (Approve/Reject)
// @route   PUT /api/quotations/:id/status
// @access  Private
exports.updateQuotationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const quotation = await Quotation.findById(req.params.id).populate('rfq vendor');
        
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        quotation.status = status;
        await quotation.save();

        if (status === 'Approved') {
            // Also update RFQ to awarded
            const rfq = await RFQ.findById(quotation.rfq._id);
            if (rfq) {
                rfq.status = 'Awarded';
                await rfq.save();
            }
        }

        // Log Activity
        await Activity.create({
            action: `Quotation ${status}`,
            details: `Quotation from ${quotation.vendor.name} for RFQ "${quotation.rfq.title}" was ${status}`,
            user: req.user.id
        });

        res.status(200).json({ success: true, data: quotation });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
