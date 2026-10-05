const userModel = require("../models/user.model")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function registerUser(req,res) {
    const {username, email, password, fullName:{firstName,lastName}} = req.body

    // if user exists
    const isUserExists = await userModel.findOne({
        $or : [
            {email},
            {username}
        ]
    })
    if(isUserExists){
        return res.status(409).json({msg: 'user already exists'})
    }
    
    // if user doesnt exist, create it
    const hash = await bcrypt.hash(password,10)
    const user = await userModel.create({
        username,
        email,
        password: hash,
        fullName:{firstName,lastName}
    })

    // create token
    const token = jwt.sign({
        username: user.username,
        email: user.email,
        fullName: user.fullName
    },process.env.JWT_SECRET, {expiresIn: '1d'})

    // set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 24*60*60*1000
    })

    // registeration completed
    res.status(201).json({
        msg: 'user registered successfully',
        user: user
    })
}

module.exports = {
    registerUser
}