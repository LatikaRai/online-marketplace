const request = require('supertest')
const app = require('../src/app')

describe('POST /api/auth/register', () => {

    test('should register a new user', async () => {

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'emris',
                email: 'emris@example.com',
                password: '123456',
                fullName: {
                    firstName: 'Emris',
                    lastName: 'Lawrence'
                }
            })

        expect(res.status).toBe(201)
    })

    test('should reject dublicate username or email with 409', async () => {
        const payload = {
             username: 'emris',
            email: 'emris@example.com',
            password: '123456',
            fullName: {
                firstName: 'Emris',
                lastName: 'Lawrence'
            }
        }
        await request(app).post('/api/auth/register').send(payload)
        const res = await request(app).post('/api/auth/register').send(payload)
        expect(res.status).toBe(409)
    })

})