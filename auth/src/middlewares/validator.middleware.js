const { body, validationResult } = require("express-validator");

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

module.exports = {
    registerUserValidation
}