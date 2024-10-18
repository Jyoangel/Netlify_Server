const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};
// Define FeeNotice schema
const FeeNoticeSchema = new Schema({
    fee: {
        type: Schema.Types.ObjectId,
        ref: 'Fee',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    dueAmount: {
        type: Number,
        required: true
    },
    months: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: getCurrentDateIST
    }
});

module.exports = mongoose.model('FeeNotice', FeeNoticeSchema);

{/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define FeeNotice schema
const FeeNoticeSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'StudentDetails',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    remark: {
        type: String,
        required: true
    },
    dueAmount: {
        type: Number,
        required: true
    },
    months: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FeeNotice', FeeNoticeSchema);
*/}