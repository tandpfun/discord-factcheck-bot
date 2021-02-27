const mongoose = require('mongoose');
const { defaultSettings: defaults } = require('../config')

const guildSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    guildID: String,
    prefix: {
        type: String,
        default: defaults.prefix
    },
    checkMessages: {
        type: Boolean,
        default: defaults.checkMessages
    },
    messagesCheckedDuplicate: {
        type: Number,
        default: defaults.checkedFalseCount
    },
    messagesCheckedFalse: {
        type: Number,
        default: defaults.checkedFalseCount
    },
    messagesCheckedTrue: {
        type: Number,
        default: defaults.checkedFalseCount
    },
    messagesChecked: {
        type: Number,
        default: defaults.messagesChecked
    },
    messagesCheckedError: {
        type: Number,
        default: defaults.checkErrors
    },
}, {
    collection: 'guilds'
});

module.exports = mongoose.model('Guild', guildSchema)
