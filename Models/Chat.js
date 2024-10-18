
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    time: { type: String, required: true },
    sender: { type: String, required: true },
    senderModel: { type: String, required: true },
    receiver: { type: String, required: true },
    receiverModel: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String },
    voiceUrl: { type: String }
});

module.exports = mongoose.model('Chat', chatSchema);

{/*const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['TeacherDetail', 'StudentDetail']
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'receiverModel',
        required: true
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['TeacherDetail', 'StudentDetail']
    },
    text: {
        type: String,

    },
    fileUrl: {
        type: String,

    },
    voiceUrl: {
        type: String,

    },
    time: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
*/}
