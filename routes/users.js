const express = require('express');
const router = express.Router();
const {validatorCreateItem, validatorGetItem} = require('../validators/users');
const {getUsers, getUser, createUser, updateUser, deleteUser, updateRole, getMe, deleteAccount} = require('../controllers/users');
const {checkRole} = require('../middleware/role');
const {authMiddleware} = require('../middleware/session');

// router.get('/', getUsers);
router.get('/me', authMiddleware, getMe);
router.get('/:id', validatorGetItem, getUser);
router.post('/',validatorCreateItem, createUser);
router.put('/:id', authMiddleware, updateUser);
router.put('/role/:id', authMiddleware, checkRole(['admin']), updateRole);
// router.delete('/:id', deleteUser);
router.delete('/account', authMiddleware, deleteAccount);


module.exports = router;