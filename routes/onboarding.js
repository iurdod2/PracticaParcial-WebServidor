const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/session');
const { validatorPersonalData, validatorCompanyData } = require('../validators/onboarding');
const { updatePersonalData, updateCompanyData } = require('../controllers/onboarding');

router.put('/personal', authMiddleware, validatorPersonalData, updatePersonalData);
router.patch('/company', authMiddleware, validatorCompanyData, updateCompanyData);

module.exports = router;