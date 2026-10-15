const userModel = require("../models/user.model")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const redis = require('../db/redis')

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

async function loginUser(req, res) {
    const { username, email, password } = req.body

    const user = await userModel.findOne({
        $or: [{ email }, { username }]
    }).select('+password')

    if (!user) {
        console.log('LOGIN - user not found')
        return res.status(401).json({
            msg: 'invalid credentials'
        })
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password || ''
    )

    if (!isPasswordCorrect) {
        return res.status(401).json({
            msg: 'invalid credentials'
        })
    }

    console.log('LOGIN 5 - creating token')
    console.log('JWT SECRET:', process.env.JWT_SECRET)

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: {
                firstName: user.fullName.firstName,
                lastName: user.fullName.lastName
            },
            role: user.role
        },
        process.env.JWT_SECRET
    )

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
        msg: 'user logged in successfully',
        user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
    }
    })
}

async function getUser(req,res) {
    return res.status(200).json({
        msg: 'current user fetch successfully',
        user: req.user
    })
}

async function logoutUser(req,res) {
    const token = req.cookies.token

    if(token){
        await redis.set(`blacklist:${token}`, 'true', 'EX', 24*60*60)
    }

    res.clearCookie('token', {
        httpOnly: true, 
        secure: true
    })
    return res.status(200).json({msg: 'logged out successfully'})
}

async function getUserAddresses(req,res) {
    const id = req.user.id

    const user = await userModel.findById(id).select('addresses')

    if(!user){
        return res.status(404).json({
            msg: 'user not found'
        })
    }

    return res.status(200).json({
        msg: 'addresses fetched successfully',
        addresses: user.addresses
    })
}

async function addNewAddress(req,res) {
    const id = req.user.id

    const { street,city,state,pincode,country,isDefault} = req.body

    const user = await userModel.findOneAndUpdate({_id:id}, {
        $push: { addresses: 
            { street, city, state, pincode, country, isDefault }
        }
    },{ new: true })

    if (!user){
        return res.status(404).json({
            msg: 'user not found'
        })
    }
    return res.status(201).json({
        msg: 'address added successfully',
        addresses: user.addresses
    })
}

async function deleteUserAddress(req,res) {
    const id = req.user.id

    const { addressId } = req.params

    const isAddressExists = await userModel.findOne({_id: id, 'addresses._id': addressId})

    if(!isAddressExists){
        return res.status(404).json({
            msg: 'address not found'
        })
    }

    const user = await userModel.findOneAndUpdate({_id: id}, {
        $pull: {
            addresses: {_id: addressId}
        }
    }, {new: true})

    if(!user){
        return res.status(404).json({
            msg: 'user not found'
        })
    }

    return res.status(200).json({
        msg: 'address is successfully deleted',
        addresses: user.addresses
    })
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    logoutUser,
    getUserAddresses,
    addNewAddress,
    deleteUserAddress
}