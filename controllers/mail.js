const {sendEmail} = require('../utils/handleEmail');
const {handleHttpError} = require('../utils/handleHttpError');
const {matchedData} = require('express-validator');


const send = async(req, res) =>{
    try {
        const info = matchedData(req);
        const data = await sendEmail(info);
        res.send(data);
    } catch (error) {
        // handleHttpError(res, 'ERROR_SEND_EMAIL');
        console.log(error);
    }
}

module.exports = {send};