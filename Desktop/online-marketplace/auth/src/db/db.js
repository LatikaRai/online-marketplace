const mongoose = require('mongoose')

async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('db connected successfully')
    } catch (error) {
        console.error('db conncetion failed: ', error)
    }
}

module.exports = connectDb