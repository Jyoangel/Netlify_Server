const mongoose = require('mongoose');
const { Schema } = mongoose;

const communicationSchema = new Schema({
    studentID: {
        type: String,
        required: true,
        ref: 'StudentDetail'
    },

    selected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Communication', communicationSchema);
