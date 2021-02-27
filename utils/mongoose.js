const mongoose = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        mongoose.connect(process.env.MONGODB_URL, dbOptions);
        mongoose.Promise = global.Promise

        mongoose.connection.on('connected', () => {
            console.log(`[MongoDB] Connected to Database`)
        })

        mongoose.connection.on('err', err => {
            console.log(`[MongoDB] Error connecting to database:`)
            console.error(err)
        })

        mongoose.connection.on('disconnected', () => {
            console.log(`[MongoDB] Disconnected from database`)
        })
    }
}
module.exports.mongoose = mongoose
