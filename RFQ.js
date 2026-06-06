const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
});

const rfqSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an RFQ title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    items: [itemSchema],
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    vendors: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Vendor'
    }],
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Awarded'],
        default: 'Open'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RFQ', rfqSchema);
