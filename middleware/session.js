const {handleError} = require('../utils/handleError');
const {verifyToken} = require('../utils/handleJwt');
const { usersModel} = require('../models/index');


const authMiddleware = async(req, res, next) =>{
    try {
        if(!req.headers.authorization){
            handleError(res, 'NOT_TOKEN', 401);
            return
        }
        //nos llega la palabra reservada bearer y el token, asi que me quedo ocn la ultima parte
        const token = req.headers.authorization.split(' ').pop();

        //del token, miramos en payload (revisar verifytoken de utils/handlejwt)
        const dataToken = verifyToken(token);

        if(!dataToken._id){
            handleError(res, 'ERROR_ID_TOKEN', 401)
            return
        }

        //PARA SABER QUÉ ROL TIENE
        const user = await usersModel.findById(dataToken._id);
        req.user = user; //inyecto al user en la petición

        next()
    } catch (error) {   
        handleError(res, 'NOT_SESSION', 401)
    }
 
}


module.exports = {authMiddleware};