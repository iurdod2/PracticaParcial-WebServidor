// validators/projects.js
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");
const mongoose = require("mongoose");

const validatorCreateProject = [
    check("name")
        .exists().withMessage("El nombre del proyecto es requerido")
        .notEmpty().withMessage("El nombre del proyecto no puede estar vacío")
        .isString().withMessage("El nombre del proyecto debe ser un texto"),
    check("description")
        .optional()
        .isString().withMessage("La descripción debe ser un texto"),
    check("clientId")
        .exists().withMessage("El ID del cliente es requerido")
        .notEmpty().withMessage("El ID del cliente no puede estar vacío")
        .isMongoId().withMessage("El ID del cliente no es válido"),
    check("startDate")
        .optional()
        .isISO8601().toDate().withMessage("La fecha de inicio debe ser una fecha válida"),
    check("endDate")
        .optional()
        .isISO8601().toDate().withMessage("La fecha de fin debe ser una fecha válida"),
    check("status")
        .optional()
        .isIn(['pending', 'in-progress', 'completed', 'on-hold'])
        .withMessage("El estado debe ser uno de: pending, in-progress, completed, on-hold"),
    (req, res, next) => {
        // Si ambas fechas están presentes, validar que endDate sea posterior a startDate
        if (req.body.startDate && req.body.endDate) {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(req.body.endDate);
            
            if (endDate < startDate) {
                return res.status(400).json({
                    errors: [{
                        msg: "La fecha de fin debe ser posterior a la fecha de inicio",
                        param: "endDate"
                    }]
                });
            }
        }
        
        return validateResults(req, res, next);
    }
];

const validatorGetProject = [
    check("id")
        .exists().withMessage("ID de proyecto es requerido")
        .notEmpty().withMessage("ID de proyecto no puede estar vacío")
        .isMongoId().withMessage("ID de proyecto no válido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

module.exports = { validatorCreateProject, validatorGetProject };