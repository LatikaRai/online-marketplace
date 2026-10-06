const jwt = require('jsonwebtoken')

async function authMiddleware(req,res,next) {
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({msg: 'unauthorized'})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
        msg: 'invalid token'
    })
    }
}

module.exports = {
    authMiddleware
}