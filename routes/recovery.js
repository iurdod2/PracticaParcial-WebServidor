const express = require('express');
const router = express.Router();

const { validatorRequestReset, validatorResetPassword } = require('../validators/recovery');
const { requestPasswordReset, resetPassword } = require('../controllers/recovery');

router.post('/request', validatorRequestReset, requestPasswordReset);
router.post('/reset', validatorResetPassword, resetPassword);

module.exports = router;