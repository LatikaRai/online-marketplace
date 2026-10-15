const express = require('express')
const validator = require('../middlewares/validator.middleware')
const authController = require('../controllers/auth.controller')
const middleware = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register', validator.registerUserValidation, authController.registerUser)
router.post('/login', validator.loginUserValidation, authController.loginUser)
router.get('/me', middleware.authMiddleware, authController.getUser)
router.get('/logout', middleware.authMiddleware, authController.logoutUser)
router.get('/users/me/addresses', middleware.authMiddleware, authController.getUserAddresses)
router.post('/users/me/addresses', middleware.authMiddleware, validator.userAddressValidation, authController.addNewAddress)
router.delete('/users/me/addresses/:addressId', middleware.authMiddleware, validator.addressIdValidation, authController.deleteUserAddress)

module.exports = router