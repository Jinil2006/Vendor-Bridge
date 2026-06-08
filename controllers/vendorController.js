const Vendor = require('../models/Vendor');
const Activity = require('../models/Activity');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
exports.getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort('-createdAt');
        res.status(200).json({ success: true, count: vendors.length, data: vendors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private
exports.getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Admin, Manager, Procurement Officer)
exports.createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(req.body);
        
        // Log Activity
        await Activity.create({
            action: 'New Vendor Registered',
            details: `Vendor "${vendor.name}" was added to the system`,
            user: req.user.id
        });

        res.status(201).json({ success: true, data: vendor });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Vendor with this email already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
exports.updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: vendor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
