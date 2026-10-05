jest.setTimeout(30000)

const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

// create database
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()

    const uri = mongoServer.getUri()
    process.env.MONGO_URI = uri
    process.env.JWT_SECRET = 'secret123'

    await mongoose.connect(uri)
})

// clearing database
afterEach(async () => {
    const collections = mongoose.connection.collections

    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})

// stop database
afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})