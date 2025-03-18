const { handleError } = require('../utils/handleError');

const checkRole = (roles) => (req, res, next) => {

    try {
        const userRole = req.user.role;

        if(userRole.includes(roles)){
            next();
        }else{
            res.status(400).send({error: 'NOT_ALLOWED'});
        }
    } catch (error) {
        console.log('ERROR: ', error.message);
        handleError(res, 'ERROR_PERMISSIONS');
    }
};

module.exports = {checkRole};