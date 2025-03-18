const { handleError } = require('../utils/handleError')

const customHeader = (req, res, next) =>{
    try {
        const apiKey = req.headers.api_key;

        if(apiKey === process.env.API_KEY) {
            next();
        }else{
            res.status(403).send('api key no es correcto')
        }
    } catch (error) {
        console.log('ERROR: ', error.message);
        handleError(res, 'ERROR_GET_ITEMS', 402); //por defecto es 403, pero podemos pasarle el que queramos
    }
}

module.exports = customHeader;