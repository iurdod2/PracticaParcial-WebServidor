const express = require('express');
const router = express.Router();
const {validatorCreateItem, validatorGetItem} = require('../validators/users');
const {getUsers, getUser, createUser, updateUser, deleteUser, updateRole} = require('../controllers/users');

//MIDDLEWARES
const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

//con el controlador
router.get('/', getUsers);
router.get('/:id', validatorGetItem, getUser);
router.post('/',validatorCreateItem, createUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/role/:id', authMiddleware, checkRole(['admin']), updateRole);
router.delete('/:id', deleteUser);


module.exports = router;