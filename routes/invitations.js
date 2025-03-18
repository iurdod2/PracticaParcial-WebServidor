const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/session');
const { validatorInvite, validatorAcceptInvitation } = require('../validators/invitations');
const { inviteUser, acceptInvitation } = require('../controllers/invitations');

router.post('/invite', authMiddleware, validatorInvite, inviteUser);
router.post('/accept', validatorAcceptInvitation, acceptInvitation);

module.exports = router;