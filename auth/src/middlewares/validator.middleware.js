const { body, validationResult, param } = require("express-validator");

const respondWithValidationErrors = (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next()
}

const registerUserValidation = [
    body('username')
    .isString(). withMessage('username must be string')
    .isLength({min: 3}).withMessage('username must be at least 3 characters long')
    .notEmpty().withMessage('username must not be empty'),
    body('email')
    .isEmail().withMessage('invalid email address')
    .notEmpty().withMessage('email must not be empty'),
    body('password')
    .isLength({min:6}).withMessage('password must be 6 at least 6 characters long')
    .notEmpty().withMessage('password must not be empty'),
    body('fullName.firstName')
    .isString().withMessage('firstName must be a string')
    .notEmpty().withMessage('firstName must not be empty'),
    body('fullName.lastName')
    .isString().withMessage('lastName must be a string')
    .notEmpty().withMessage('lastName must not be empty'),
    respondWithValidationErrors
]

const loginUserValidation = [
    body('email')
    .optional()
    .isEmail().withMessage('invalid email address')
    .notEmpty().withMessage('email must not be empty'),
    body('password')
    .isLength({min:6}).withMessage('password must be 6 at least 6 characters long')
    .notEmpty().withMessage('password must not be empty'),
    body('username')
    .optional()
    .isString(). withMessage('username must be string')
    .isLength({min: 3}).withMessage('username must be at least 3 characters long')
    .notEmpty().withMessage('username must not be empty'),
    (req,res,next)=>{
        if(!req.body.email && !req.body.username){
            return res.status(400).json({
                errors: [{msg: 'either email or username is required'}]
            })
        }
        next()
    },
    respondWithValidationErrors
]
const userAddressValidation = [
    body('street')
    .notEmpty().withMessage('street must not be empty')
    .isString(). withMessage('street must be string'),
    body('city')
    .notEmpty().withMessage('city must not be empty')
    .isString(). withMessage('city must be string'),
    body('state')
    .notEmpty().withMessage('state must not be empty')
    .isString(). withMessage('state must be string'),
    body('pincode')
    .notEmpty().withMessage('pincode must not be empty')
    .isString(). withMessage('pincode must be string'),
    body('country')
    .notEmpty().withMessage('country must not be empty')
    .isString(). withMessage('country must be string'),
    body('isDefault')
    .optional()
    .isBoolean(). withMessage('isDefault must be boolean'),
    respondWithValidationErrors
]

const addressIdValidation = [
    param('addressId')
    .isMongoId()
    .withMessage('Invalid address ID'),
    respondWithValidationErrors
]

module.exports = {
    registerUserValidation,
    loginUserValidation,
    userAddressValidation,
    addressIdValidation
}