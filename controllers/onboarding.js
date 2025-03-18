const { matchedData } = require('express-validator');
const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');

const updatePersonalData = async (req, res) => {
    try {
        // Obtener datos validados del cuerpo
        const body = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Actualizar los datos personales
        const updatedUser = await usersModel.findByIdAndUpdate(_id, 
            { 
                name: body.name, 
                surname: body.surname, 
                nif: body.nif 
            },
            { new: true }
        );
        
        // Eliminar campos sensibles
        updatedUser.set('password', undefined, {strict: false});
        updatedUser.set('verificationCode', undefined, {strict: false});
        
        res.status(200).send({ 
            message: 'Personal data updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_UPDATING_PERSONAL_DATA', 500);
    }
};

const updateCompanyData = async (req, res) => {
    try {
        // Obtener datos validados del cuerpo
        const body = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario
        const user = await usersModel.findById(_id);
        
        // Si el usuario es autónomo, usar los datos personales
        if (body.isAutonomo) {
            // Verificar que el usuario tiene datos personales
            if (!user.name || !user.surname || !user.nif) {
                return res.status(400).send({ 
                    error: 'Personal data is required for autonomous workers. Please update personal data first.'
                });
            }
            
            // Actualizar con los datos personales
            await usersModel.findByIdAndUpdate(_id, {
                companyName: `${user.name} ${user.surname}`,
                cif: user.nif,
                address: body.address,
                city: body.city,
                postalCode: body.postalCode,
                isAutonomo: true
            });
        } else {
            // Actualizar con los datos de la compañía proporcionados
            await usersModel.findByIdAndUpdate(_id, {
                companyName: body.companyName,
                cif: body.cif,
                address: body.address,
                city: body.city,
                postalCode: body.postalCode,
                isAutonomo: false
            });
        }
        
        // Obtener el usuario actualizado
        const updatedUser = await usersModel.findById(_id);
        
        // Eliminar campos sensibles
        updatedUser.set('password', undefined, {strict: false});
        updatedUser.set('verificationCode', undefined, {strict: false});
        
        res.status(200).send({
            message: 'Company data updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_UPDATING_COMPANY_DATA', 500);
    }
};

module.exports = { updatePersonalData, updateCompanyData };