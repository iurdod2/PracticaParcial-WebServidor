const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorInvite = [
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorAcceptInvitation = [
    check("userId")
        .exists().withMessage("ID de usuario es requerido")
        .notEmpty().withMessage("ID de usuario no puede estar vacío")
        .isMongoId().withMessage("Formato de ID de usuario inválido"),
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