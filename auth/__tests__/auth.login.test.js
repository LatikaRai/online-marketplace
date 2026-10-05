const connectDb = require('../src/db/db')
const userModel = require('../src/models/user.model')
const request = require('supertest')
const app = require('../src/app')
const bcrypt = require('bcryptjs')

describe('POST api/auth/login', () => {

    beforeAll(async () => {
        await connectDb()
    })

    afterEach(async () => {
        await userModel.deleteMany({})
    })

    test('logs in with correct credentials & returns 200 with user & cookie', async () => {

        const password = '123456'
        const hash = await bcrypt.hash(password, 10)

        await userModel.create({
            username: 'john',
            email: 'john@gmail.com',
            password: hash,
            fullName: {
                firstName: 'John',
                lastName: 'Doe'
            }
        })

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@gmail.com',
                password
            })

        expect(res.status).toBe(200)

        console.log('status',res.status)
        console.log('status',res.body)

        expect(res.body.user).toBeDefined()
        expect(res.body.user.email).toBe('john@gmail.com')

        const setCookie = res.headers['set-cookie']

        expect(setCookie).toBeDefined()
        expect(setCookie.join(';')).toMatch(/token=/)
    })

    test('rejects wrong password with 401', async () => {

        const password = '123456'
        const hash = await bcrypt.hash(password, 10)

        await userModel.create({
            username: 'john',
            email: 'john@gmail.com',
            password: hash,
            fullName: {
                firstName: 'John',
                lastName: 'Doe'
            }
        })

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@gmail.com',
                password: '654321'
            })

        expect(res.status).toBe(401)
    })
})