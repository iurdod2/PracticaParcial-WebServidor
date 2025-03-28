const mongoose = require("mongoose")
const UserScheme = new mongoose.Schema(
 {
    email: {
        type: String,
        unique: true
    },
    password:{
        type: String
    },
    role:{
        type: ["user", "admin", "guest"],
        default: "user"
    },
    verified:{
        type: Boolean,
        default: false
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
        default: 3,
    },
    // Datos personales
    name: {
        type: String,
    },
    surname: {
        type: String,
    },
    nif: {
        type: String,
    },
    // Datos de la compañía
    companyName: {
        type: String,
    },
    cif: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    postalCode: {
        type: String,
    },
    isAutonomo: {
        type: Boolean,
        default: false,
    },
    active: {
      type: Boolean,
      default: true
    },
    resetCode: {
      type: String
    },
    resetCodeExpires: {
      type: Date
    },
    invitationCode: {
      type: String
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
 },
 {
    timestamps: true,
    versionKey: false
 }
)
module.exports = mongoose.model("users", UserScheme)