const express = require('express')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.route')

const app = express()

// middlewares
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRouter)

module.exports = app