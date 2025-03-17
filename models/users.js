const mongoose = require("mongoose")
const UserScheme = new mongoose.Schema(
 {
    email: {
        type: String,
        unique: true
    },
    password:{
        type: String // TODO Guardaremos el hash
    },
    role:{
        type: ["user", "admin"], // es el enum de SQL
        default: "user"
    },
    status:{
        type: Boolean,
        default: flase
    },
    verificationCode: {
        type: String,
      },
    verificationAttempts: {
        type: Number,
        default: 0,
      },
      maxVerificationAttempts: {
        type: Number,
        default: 3, // Número máximo de intentos
      },
 },
 {
    timestamps: true, // TODO createdAt, updatedAt
    versionKey: false
 }
)
module.exports = mongoose.model("users", UserScheme) // "users" es el nombre de la colección en mongoDB (o de la tabla en SQL)