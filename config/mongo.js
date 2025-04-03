const mongoose = require('mongoose')

const dbConnect = () => {
    const db_uri = process.env.NODE_ENV === 'test' ? process.env.DB_URI:process.env.DB_URI_TEST
    mongoose.set('strictQuery', false)
    mongoose.connect(db_uri)
}

mongoose.connection.on('connected', () => console.log("Conectado a la BD"))

mongoose.connection.on('error', (e) => console.log (e.message))

module.exports = dbConnect