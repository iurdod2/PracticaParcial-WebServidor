const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorRequestReset = [
    check("email")
        .exists().withMessage("Email es requerido")
        .notEmpty().withMessage("Email no puede estar vacío")
        .isEmail().withMessage("Formato de email inválido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorResetPassword = [
    check("email")
        .exists().withMessage("Email es requerido")
        .notEmpty().withMessage("Email no puede estar vacío")
        .isEmail().withMessage("Formato de email inválido"),
    check("code")
        .exists().withMessage("El código es requerido")
        .notEmpty().withMessage("El código no puede estar vacío")
        .isLength({ min: 6, max: 6 }).withMessage("El código debe tener 6 dígitos")
        .isNumeric().withMessage("El código debe ser numérico"),
    check("newPassword")
        .exists().withMessage("La nueva contraseña es requerida")
        .notEmpty().withMessage("La nueva contraseña no puede estar vacía")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorRequestReset, validatorResetPassword };