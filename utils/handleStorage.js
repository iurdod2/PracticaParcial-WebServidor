const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, callback){
        const pathStorage = __dirname+'/../storage';
        callback(null, pathStorage); 
    },
    filename: function (req, file, callback){
        const ext = file.originalname.split('.').pop();
        const originalNameToFile = file.originalname.split('.').shift();

        const fileName = 'file-'+originalNameToFile+'-'+Date.now()+'.'+ext;
        callback(null, fileName);
    }
});

const uploadMiddleware = multer({storage:storage, limits: {fileSize: 5000}});

const memory = multer.memoryStorage();
const uploadMiddlewareMemory= multer({storage:memory, limits:{fileSize: 5 *1024*1024}});

module.exports = {uploadMiddleware, uploadMiddlewareMemory};