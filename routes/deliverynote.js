// routes/deliverynote.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/session');
const { uploadMiddlewareMemory } = require('../utils/handleStorage');
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
const { 
    getDeliveryNotePdf, 
    signDeliveryNote, 
    addGuestAccess, 
    safeDeleteDeliveryNote 
} = require('../controllers/deliverynote-pdf');

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

// Generar y descargar PDF
router.get('/pdf/:id', authMiddleware, validatorGetDeliveryNote, getDeliveryNotePdf);

// Firmar albarán
router.post('/:id/sign', authMiddleware, validatorGetDeliveryNote, uploadMiddlewareMemory.single('signature'), signDeliveryNote);

// Añadir acceso de invitado
router.post('/:id/guest', authMiddleware, validatorGetDeliveryNote, addGuestAccess);

// Eliminar albarán (solo si no está firmado)
router.delete('/:id/safe', authMiddleware, validatorGetDeliveryNote, safeDeleteDeliveryNote);

module.exports = router;