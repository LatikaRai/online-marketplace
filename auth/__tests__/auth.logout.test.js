const request = require("supertest")
const app = require("../src/app")
const connectDb = require("../src/db/db")
const userModel = require("../src/models/user.model")
const bcrypt = require("bcryptjs")

jest.mock("ioredis")

describe('GET /api/auth/logout', ()=> {
    beforeAll(async () => {
        await connectDb()
    })

    test('clears auth cookie & returns 200 when logged in', async () => {
        const password = '123456'
        const hash = await bcrypt.hash(password, 10)
        await userModel.create({
            username: 'abc', 
            email: 'abc@ex.com',
            password: hash,
            fullName: {firstName: 'abc', lastName: 'def'}
        })

        const loginRes = await request(app).post('/api/auth/login').send({email:'abc@ex.com', password})
        expect(loginRes.status).toBe(200)

        const cookies = loginRes.headers['set-cookie']
        expect(cookies).toBeDefined()

        // for logout
        const res = await request(app).get('/api/auth/logout').set('cookie', cookies)
        expect(res.status).toBe(200)

        const setCookie = res.headers['set-cookie'] || []
        const cookieStr = setCookie.join(';')
        expect(cookieStr).toMatch(/token=;/)
        expect(cookieStr.toLowerCase()).toMatch(/expires=/)
    })

    test('is idempotent: returns 401 even without the auth cookie', async () => {
        const res = await request(app).get('/api/auth/logout')
        expect(res.status).toBe(401)
    })
})