const express = require('express');
const router = express.Router();
const {uploadMiddleware, uploadMiddlewareMemory} = require('../utils/handleStorage.js');
const {createItem, updateLogo} =  require('../controllers/storage.js');
const {authMiddleware} = require('../middleware/session'); // Usando el middleware de autenticación que tienes

router.post('/local', uploadMiddleware.single('image'), createItem);
router.post('/memory', uploadMiddlewareMemory.single('image'), (err, req, res, next) =>{
    if(err){
       res.status(400).send('ERROR: '+ err.message);
    }
}, createItem); 

// Nueva ruta para actualizar el logo
router.patch('/logo', 
    authMiddleware,
    uploadMiddlewareMemory.single('logo'), 
    (err, req, res, next) => {
        if(err){
           res.status(400).send('ERROR: '+ err.message);
        }
        next();
    }, 
    updateLogo
);

module.exports = router;