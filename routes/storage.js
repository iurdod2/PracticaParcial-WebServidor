const express = require('express');
const router = express.Router();
const {uploadMiddleware, uploadMiddlewareMemory} = require('../utils/handleStorage.js');
const {createItem} =  require('../controllers/storage.js');

router.post('/local', uploadMiddleware.single('image'), createItem);
router.post('/memory', uploadMiddlewareMemory.single('image'), (err, req, res, next) =>{
    if(err){
       res.status(400).send('ERROR: '+ err.message);
    }
}, createItem); 

module.exports = router;

