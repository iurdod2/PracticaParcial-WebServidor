const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorCreateClient = [
    check("name")
        .exists().withMessage("El nombre del cliente es requerido")
        .notEmpty().withMessage("El nombre del cliente no puede estar vacío")
        .isString().withMessage("El nombre del cliente debe ser un texto"),
    check("email")
        .exists().withMessage("El email es requerido")
        .notEmpty().withMessage("El email no puede estar vacío")
        .isEmail().withMessage("Debe ser un email válido"),
    check("phone")
        .optional()
        .isString().withMessage("El teléfono debe ser un texto"),
    check("contactPerson")
        .optional()
        .isString().withMessage("El nombre de contacto debe ser un texto"),
    check("nif")
        .optional()
        .isString().withMessage("El NIF debe ser un texto"),
    check("address")
        .optional()
        .isString().withMessage("La dirección debe ser un texto"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorGetClient = [
    check("id")
        .exists().withMessage("ID de cliente es requerido")
        .notEmpty().withMessage("ID de cliente no puede estar vacío")
        .isMongoId().withMessage("ID de cliente no válido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorCreateClient, validatorGetClient };