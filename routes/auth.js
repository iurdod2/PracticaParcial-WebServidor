const express = require('express');
const router = express.Router();

const {authMiddleware} = require('../middleware/session');
const {validatorRegister, validatorLogin} = require('../validators/auth');
const {register, login} = require('../controllers/auth');


router.post('/register', validatorRegister, register);
router.post('/login', validatorLogin, login);

module.exports = router;