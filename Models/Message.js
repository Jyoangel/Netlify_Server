const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    message: {
        type: String,
        required: [true, 'Message content is required']
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
