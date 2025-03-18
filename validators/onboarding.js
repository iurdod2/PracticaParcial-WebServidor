const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorPersonalData = [
    check("name")
        .exists().withMessage("El nombre es requerido")
        .notEmpty().withMessage("El nombre no puede estar vacío")
        .isString().withMessage("El nombre debe ser un texto"),
    check("surname")
        .exists().withMessage("Los apellidos son requeridos")
        .notEmpty().withMessage("Los apellidos no pueden estar vacíos")
        .isString().withMessage("Los apellidos deben ser un texto"),
    check("nif")
        .exists().withMessage("El NIF es requerido")
        .notEmpty().withMessage("El NIF no puede estar vacío")
        .isString().withMessage("El NIF debe ser un texto")
        .matches(/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i).withMessage("El formato del NIF no es válido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorCompanyData = [
    check("companyName")
        .exists().withMessage("El nombre de la compañía es requerido")
        .notEmpty().withMessage("El nombre de la compañía no puede estar vacío")
        .isString().withMessage("El nombre de la compañía debe ser un texto"),
    check("cif")
        .exists().withMessage("El CIF es requerido")
        .notEmpty().withMessage("El CIF no puede estar vacío")
        .isString().withMessage("El CIF debe ser un texto")
        .matches(/^[A-Z][0-9]{8}$/i).withMessage("El formato del CIF no es válido"),
    check("address")
        .exists().withMessage("La dirección es requerida")
        .notEmpty().withMessage("La dirección no puede estar vacía")
        .isString().withMessage("La dirección debe ser un texto"),
    check("city")
        .exists().withMessage("La ciudad es requerida")
        .notEmpty().withMessage("La ciudad no puede estar vacía")
        .isString().withMessage("La ciudad debe ser un texto"),
    check("postalCode")
        .exists().withMessage("El código postal es requerido")
        .notEmpty().withMessage("El código postal no puede estar vacío")
        .isString().withMessage("El código postal debe ser un texto")
        .matches(/^[0-9]{5}$/).withMessage("El formato del código postal no es válido"),
    check("isAutonomo")
        .optional()
        .isBoolean().withMessage("El campo isAutonomo debe ser booleano"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorPersonalData, validatorCompanyData };