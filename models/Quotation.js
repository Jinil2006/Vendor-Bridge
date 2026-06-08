const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
    rfq: {
        type: mongoose.Schema.ObjectId,
        ref: 'RFQ',
        required: true
    },
    vendor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [quotationItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    terms: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    submittedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quotation', quotationSchema);
