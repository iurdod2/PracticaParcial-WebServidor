const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/session');
const { validatorRegister, validatorLogin, validatorValidation } = require('../validators/auth');
const { register, login, validateEmail, resendVerificationCode } = require('../controllers/auth');

router.post('/register', validatorRegister, register);
router.post('/login', validatorLogin, login);
router.put('/validation', authMiddleware, validatorValidation, validateEmail);
router.post('/resend-code', authMiddleware, resendVerificationCode);

module.exports = router;