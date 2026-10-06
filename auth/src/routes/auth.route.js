const express = require('express')
const validator = require('../middlewares/validator.middleware')
const authController = require('../controllers/auth.controller')
const middleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register', validator.registerUserValidation, authController.registerUser)
router.post('/login', validator.loginUserValidation, authController.loginUser)
router.get('/me', middleware.authMiddleware, authController.getUser)

module.exports = router