const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const userModel = require('../src/models/user.model')

describe('User addresses API', () => {
    let user
    let token

    const address = {
        street: '123 Main Street',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
    }

    beforeEach(async () => {
        user = await userModel.create({
            username: 'john',
            email: 'john@gmail.com',
            password: 'hashedPassword',
            fullName: {
                firstName: 'John',
                lastName: 'Doe'
            },
            addresses: []
        })

        token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET
        )
    })

    // GET /api/auth/users/me/addresses

    describe('GET /api/auth/users/me/addresses', () => {
        test('returns all addresses of the logged-in user', async () => {
            user.addresses.push(
                address,
                {
                    ...address,
                    street: '456 Park Street'
                }
            )
            await user.save()

            const res = await request(app)
                .get('/api/auth/users/me/addresses')
                .set('Cookie', `token=${token}`)

            expect(res.status).toBe(200)

            // Adjust "addresses" to match your response structure
            expect(res.body.addresses).toHaveLength(2)
            expect(res.body.addresses[0].city).toBe('Delhi')
        })

        test('returns an empty array when the user has no addresses', async () => {
            const res = await request(app)
                .get('/api/auth/users/me/addresses')
                .set('Cookie', `token=${token}`)

            expect(res.status).toBe(200)
            expect(res.body.addresses).toEqual([])
        })

        test('returns 401 when the user is not authenticated', async () => {
            const res = await request(app)
                .get('/api/auth/users/me/addresses')

            expect(res.status).toBe(401)
        })
    })

    // POST /api/auth/users/me/addresses

    describe('POST /api/auth/users/me/addresses', () => {
        test('adds a new address', async () => {
            const res = await request(app)
                .post('/api/auth/users/me/addresses')
                .set('Cookie', `token=${token}`)
                .send(address)

            expect(res.status).toBe(201)

            const updatedUser = await userModel.findById(user._id)

            expect(updatedUser.addresses).toHaveLength(1)
            expect(updatedUser.addresses[0].city).toBe('Delhi')
            expect(updatedUser.addresses[0].street)
                .toBe('123 Main Street')
        })

        test('returns 401 when the user is not authenticated', async () => {
            const res = await request(app)
                .post('/api/auth/users/me/addresses')
                .send(address)

            expect(res.status).toBe(401)
        })

        test('rejects invalid address data', async () => {
            const res = await request(app)
                .post('/api/auth/users/me/addresses')
                .set('Cookie', `token=${token}`)
                .send({
                    city: 'Delhi'
                })

            expect(res.status).toBe(400)

            const updatedUser = await userModel.findById(user._id)
            expect(updatedUser.addresses).toHaveLength(0)
        })
    })

    // DELETE /api/auth/users/me/addresses/:addressId

    describe('DELETE /api/auth/users/me/addresses/:addressId', () => {
        test('deletes an existing address', async () => {
            user.addresses.push(address)
            await user.save()

            const addressId = user.addresses[0]._id.toString()

            const res = await request(app)
                .delete(`/api/auth/users/me/addresses/${addressId}`)
                .set('Cookie', `token=${token}`)

            expect(res.status).toBe(200)

            const updatedUser = await userModel.findById(user._id)

            expect(updatedUser.addresses).toHaveLength(0)
            expect(
                updatedUser.addresses.id(addressId)
            ).toBeNull()
        })

        test('returns 404 when the address does not exist', async () => {
            const addressId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .delete(`/api/auth/users/me/addresses/${addressId}`)
                .set('Cookie', `token=${token}`)

            expect(res.status).toBe(404)
        })

        test('rejects an invalid address ID', async () => {
            const res = await request(app)
                .delete('/api/auth/users/me/addresses/invalid-id')
                .set('Cookie', `token=${token}`)

            expect(res.status).toBe(400)
        })

        test('returns 401 when the user is not authenticated', async () => {
            const addressId = new mongoose.Types.ObjectId()

            const res = await request(app)
                .delete(`/api/auth/users/me/addresses/${addressId}`)

            expect(res.status).toBe(401)
        })
    })
})