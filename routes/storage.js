const express = require('express');
const router = express.Router();
const {uploadMiddleware, uploadMiddlewareMemory} = require('../utils/handleStorage.js');
const {createItem, updateLogo} =  require('../controllers/storage.js');
const {authMiddleware} = require('../middleware/session'); 

router.post('/local', uploadMiddleware.single('image'), createItem);

router.post('/memory', 
    uploadMiddlewareMemory.single('image'), 
    (req, res, next) => {
        // Aquí req.file ya debería estar definido
        if (!req.file) {
            return res.status(400).json({ error: "No se recibió ninguna imagen" });
        }
        next();
    }, 
    createItem
);

// Nueva ruta para actualizar el logo
router.patch('/logo', 
    authMiddleware,
    uploadMiddleware.single('logo'),
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: "No se recibió ningún logo" });
        }
        next();
    },
    updateLogo
);

module.exports = router;