const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) =>{
        return validateResults(req, res, next)
    }
]


const validatorCreateItem = [
    check('email').exists().notEmpty().isEmail().withMessage("Debe ser un email válido"),
    check('password').exists().notEmpty().isLength({ min: 8 }).withMessage('Es necesaria una contraseña y debe tener mínimo 8 caracteres'),
    check('role').exists().notEmpty(),
    validateResults
]

module.exports = {validatorCreateItem, validatorGetItem}















const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorGetItem = [
    check('id').exists().notEmpty().isMongoId(),
    (req, res, next) =>{
        return validateResults(req, res, next)
    }
]


const validatorCreateItem = [
    check('name').exists().notEmpty().withMessage('cesoqueso'),
    check('age').exists().notEmpty().withMessage('iggy'),
    check('email').exists().notEmpty(),
    check('password').exists().notEmpty(),
    check('role').exists().notEmpty(),
    validateResults
]

module.exports = {validatorCreateItem, validatorGetItem}