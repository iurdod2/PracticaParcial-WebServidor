const supertest = require('supertest')
const {app, server} = require('../app.js')
const mongoose = require('mongoose');

beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
});

const api = supertest(app);

it('should get all users', async () => {
    await api.get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(async()=> {
    server.close()
    await mongoose.connection.close();
})

const {encrypt} = require('../utils/handlePassword.js')
const {tokenSign} = require('../utils/handleJwt')
const initialUsers = [
 {name: "Marcos",
 age: 23,
 email: "marcos@correo.es",
 password: "mipassword"
 }
]
let token
beforeAll(async () => {
 await new Promise((resolve) => mongoose.connection.once('connected', resolve));
 await usersModel.deleteMany({})

 const password = await encrypt(initialUsers[0].password)
 const body = initialUsers[0]
 body.password = password
 const userData = await usersModel.create(body)
 userData.set("password", undefined, {strict: false})

 token = await tokenSign(userData, process.env.JWT_SECRET)
});