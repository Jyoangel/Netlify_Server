const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentTeacherSchema = new Schema({
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'TeacherDetail',
        required: true
    },
    month: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    status: {
        type: String,
        enum: ['Paid', 'Due'],
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    dueAmount: {
        type: Number,
        required: true
    },
    remark: {
        type: String,
        require: true
    }

}, { timestamps: true });

module.exports = mongoose.model('PaymentTeacher', paymentTeacherSchema);
