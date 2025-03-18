const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorInvite = [
    check("email")
        .exists().withMessage("Email es requerido")
        .notEmpty().withMessage("Email no puede estar vacío")
        .isEmail().withMessage("Formato de email inválido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorAcceptInvitation = [
    check("email")
        .exists().withMessage("Email es requerido")
        .notEmpty().withMessage("Email no puede estar vacío")
        .isEmail().withMessage("Formato de email inválido"),
    check("code")
        .exists().withMessage("El código es requerido")
        .notEmpty().withMessage("El código no puede estar vacío"),
    check("password")
        .exists().withMessage("La contraseña es requerida")
        .notEmpty().withMessage("La contraseña no puede estar vacía")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorInvite, validatorAcceptInvitation };