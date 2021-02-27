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
    deleteFalseFacts: {
        type: Boolean,
        default: defaults.deleteFalseFacts
    },
    falseFactThreshold: {
        type: Number,
        default: defaults.falseFactThreshold
    },
    checkedFalseCount: {
        type: Number,
        default: defaults.checkedFalseCount
    },
    messagesChecked: {
        type: Number,
        default: defaults.messagesChecked
    },
    checkErrors: {
        type: Number,
        default: defaults.checkErrors
    },
}, {
    collection: 'guilds'
});

module.exports = mongoose.model('Guild', guildSchema)
