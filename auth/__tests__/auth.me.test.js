const connectDb = require('../src/db/db')
const request = require('supertest')
const app = require('../src/app')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const userModel = require('../src/models/user.model')

describe('GET /api/auth/me', ()=>{
    beforeAll(async () => {
        await connectDb()
    })

    test('returns 401 when no auth cookie is provided', async () => {
        const res = await request(app).get('/api/auth/me')
        expect(res.statusCode).toBe(401)
    })

    test('returns 401 for wrong token in cookie', async () => {
        const fake_token = jwt.sign({id: '00000'}, 'wrong_token')
        const res = await request(app).get('/api/auth/me').set('Cookie',[`token=${fake_token}`])
        expect(res.statusCode).toBe(401)
    })

    test('returns 200 for valid token', async () => {
    const password = '123456'
    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username: 'john',
        email: 'john@ex.com',
        password: hash,
        fullName: {
            firstName: 'John',
            lastName: 'Doe'
        },
        role: 'user'
    })

    const token = jwt.sign({
        id: user._id,
        user
    }, process.env.JWT_SECRET)

    const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`])

    expect(res.statusCode).toBe(200)
})
})