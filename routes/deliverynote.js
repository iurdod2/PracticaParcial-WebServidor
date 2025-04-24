// routes/deliverynote.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/session');
const { 
    validatorCreateDeliveryNote, 
    validatorGetDeliveryNote,
    validatorChangeDeliveryNoteStatus
} = require('../validators/deliverynote');
const { 
    createDeliveryNote, 
    getDeliveryNotes, 
    getDeliveryNote, 
    updateDeliveryNote, 
    deleteDeliveryNote,
    changeDeliveryNoteStatus
} = require('../controllers/deliverynote');

// Crear un albarán
router.post('/', authMiddleware, validatorCreateDeliveryNote, createDeliveryNote);

// Listar todos los albaranes
router.get('/', authMiddleware, getDeliveryNotes);

// Obtener un albarán específico
router.get('/:id', authMiddleware, validatorGetDeliveryNote, getDeliveryNote);

// Actualizar un albarán
router.put('/:id', authMiddleware, validatorGetDeliveryNote, validatorCreateDeliveryNote, updateDeliveryNote);

// Eliminar un albarán
router.delete('/:id', authMiddleware, validatorGetDeliveryNote, deleteDeliveryNote);

// Cambiar el estado de un albarán
router.patch('/:id/status', authMiddleware, validatorChangeDeliveryNoteStatus, changeDeliveryNoteStatus);

module.exports = router;