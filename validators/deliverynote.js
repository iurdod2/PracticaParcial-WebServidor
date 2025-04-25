// validators/deliverynote.js
const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Validador para entradas de horas
const hoursEntryValidator = [
    check("hoursEntries.*.userId")
        .exists().withMessage("El ID del usuario es requerido")
        .notEmpty().withMessage("El ID del usuario no puede estar vacío")
        .isMongoId().withMessage("El ID del usuario no es válido"),
    check("hoursEntries.*.hours")
        .exists().withMessage("Las horas son requeridas")
        .notEmpty().withMessage("Las horas no pueden estar vacías")
        .isNumeric().withMessage("Las horas deben ser un número")
        .custom(value => value >= 0).withMessage("Las horas no pueden ser negativas"),
    check("hoursEntries.*.description")
        .optional()
        .isString().withMessage("La descripción debe ser un texto"),
    check("hoursEntries.*.date")
        .optional()
        .isISO8601().toDate().withMessage("La fecha debe ser una fecha válida")
];

// Validador para entradas de materiales
const materialEntryValidator = [
    check("materialEntries.*.name")
        .exists().withMessage("El nombre del material es requerido")
        .notEmpty().withMessage("El nombre del material no puede estar vacío")
        .isString().withMessage("El nombre del material debe ser un texto"),
    check("materialEntries.*.quantity")
        .exists().withMessage("La cantidad es requerida")
        .notEmpty().withMessage("La cantidad no puede estar vacía")
        .isNumeric().withMessage("La cantidad debe ser un número")
        .custom(value => value >= 0).withMessage("La cantidad no puede ser negativa"),
    check("materialEntries.*.unit")
        .optional()
        .isString().withMessage("La unidad debe ser un texto"),
    check("materialEntries.*.price")
        .optional()
        .isNumeric().withMessage("El precio debe ser un número")
        .custom(value => value >= 0).withMessage("El precio no puede ser negativo"),
    check("materialEntries.*.description")
        .optional()
        .isString().withMessage("La descripción debe ser un texto")
];

// Validador para crear o actualizar un albarán
const validatorCreateDeliveryNote = [
    check("projectId")
        .exists().withMessage("El ID del proyecto es requerido")
        .notEmpty().withMessage("El ID del proyecto no puede estar vacío")
        .isMongoId().withMessage("El ID del proyecto no es válido"),
    check("date")
        .optional()
        .isISO8601().toDate().withMessage("La fecha debe ser una fecha válida"),
    check("description")
        .optional()
        .isString().withMessage("La descripción debe ser un texto"),
    check("status")
        .optional()
        .isIn(['draft', 'sent', 'approved', 'invoiced'])
        .withMessage("El estado debe ser uno de: draft, sent, approved, invoiced"),
    // Validar hoursEntries si existe
    check("hoursEntries")
        .optional()
        .isArray().withMessage("Las entradas de horas deben ser un array"),
    ...hoursEntryValidator,
    // Validar materialEntries si existe
    check("materialEntries")
        .optional()
        .isArray().withMessage("Las entradas de materiales deben ser un array"),
    ...materialEntryValidator,
    // Verificar que al menos hay una entrada de horas o materiales
    (req, res, next) => {
        const { hoursEntries, materialEntries } = req.body;
        
        if ((!hoursEntries || hoursEntries.length === 0) && 
            (!materialEntries || materialEntries.length === 0)) {
            return res.status(400).json({
                errors: [{
                    msg: "Debe incluir al menos una entrada de horas o materiales",
                    param: "entries"
                }]
            });
        }
        
        return validateResults(req, res, next);
    }
];

// Validador para obtener un albarán por ID
const validatorGetDeliveryNote = [
    check("id")
        .exists().withMessage("ID de albarán es requerido")
        .notEmpty().withMessage("ID de albarán no puede estar vacío")
        .isMongoId().withMessage("ID de albarán no válido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

// Validador para cambiar el estado de un albarán
const validatorChangeDeliveryNoteStatus = [
    check("id")
        .exists().withMessage("ID de albarán es requerido")
        .notEmpty().withMessage("ID de albarán no puede estar vacío")
        .isMongoId().withMessage("ID de albarán no válido"),
    check("status")
        .exists().withMessage("El estado es requerido")
        .notEmpty().withMessage("El estado no puede estar vacío")
        .isIn(['draft', 'sent', 'approved', 'invoiced'])
        .withMessage("El estado debe ser uno de: draft, sent, approved, invoiced"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validatorAddGuestAccess = [
    check("id")
        .exists().withMessage("ID de albarán es requerido")
        .notEmpty().withMessage("ID de albarán no puede estar vacío")
        .isMongoId().withMessage("ID de albarán no válido"),
    check("guestId")
        .exists().withMessage("ID del invitado es requerido")
        .notEmpty().withMessage("ID del invitado no puede estar vacío")
        .isMongoId().withMessage("ID del invitado no válido"),
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

// Validador para firmar un albarán
const validatorSignDeliveryNote = [
    check("id")
        .exists().withMessage("ID de albarán es requerido")
        .notEmpty().withMessage("ID de albarán no puede estar vacío")
        .isMongoId().withMessage("ID de albarán no válido"),
    check("signedBy")
        .optional()
        .isString().withMessage("El nombre del firmante debe ser texto"),
    (req, res, next) => {
        // Verificar que hay un archivo de firma
        if (!req.file) {
            return res.status(400).json({
                errors: [{
                    msg: "Se requiere una imagen de firma",
                    param: "signature"
                }]
            });
        }
        
        // Verificar que es una imagen
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                errors: [{
                    msg: "El archivo debe ser una imagen (JPEG, PNG, GIF, SVG)",
                    param: "signature"
                }]
            });
        }
        
        return validateResults(req, res, next);
    }
];

module.exports = { 
    validatorCreateDeliveryNote, 
    validatorGetDeliveryNote,
    validatorChangeDeliveryNoteStatus,
    validatorAddGuestAccess,
    validatorSignDeliveryNote
};