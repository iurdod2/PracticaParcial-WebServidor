const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/session');
const { validatorCreateClient, validatorGetClient } = require('../validators/clients');
const { 
    createClient, 
    updateClient, 
    getClients, 
    getClient, 
    archiveClient, 
    deleteClient, 
    getArchivedClients, 
    restoreClient 
} = require('../controllers/clients');

router.post('/', authMiddleware, validatorCreateClient, createClient);
router.put('/:id', authMiddleware, validatorGetClient, validatorCreateClient, updateClient);
router.patch('/:id', authMiddleware, validatorGetClient, validatorCreateClient, updateClient);
router.get('/', authMiddleware, getClients);
router.get('/:id', authMiddleware, validatorGetClient, getClient);
router.put('/:id/archive', authMiddleware, validatorGetClient, archiveClient);
router.delete('/:id', authMiddleware, validatorGetClient, deleteClient);
router.get('/archived/list', authMiddleware, getArchivedClients);
router.put('/:id/restore', authMiddleware, validatorGetClient, restoreClient);
module.exports = router;