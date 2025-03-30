const { matchedData } = require('express-validator');
const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');

/**
 * Función para actualizar los datos personales del usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const updatePersonalData = async (req, res) => {
    try {
        // Obtener datos validados del cuerpo de la petición
        const body = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Actualizar los datos personales del usuario
        const updatedUser = await usersModel.findByIdAndUpdate(_id, 
            { 
                name: body.name, 
                surname: body.surname, 
                nif: body.nif 
            },
            { new: true } // Devolver el documento actualizado
        );
        
        // Eliminar campos sensibles antes de devolver la respuesta
        updatedUser.set('password', undefined, {strict: false});
        updatedUser.set('verificationCode', undefined, {strict: false});
        
        // Devolver el usuario actualizado
        res.status(200).send({ 
            message: 'Datos personales actualizados correctamente',
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_ACTUALIZAR_DATOS_PERSONALES', 500);
    }
};

/**
 * Función para actualizar los datos de la empresa del usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const updateCompanyData = async (req, res) => {
    try {
        // Obtener datos validados del cuerpo de la petición
        const body = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario actual
        const user = await usersModel.findById(_id);
        
        // Si el usuario es autónomo, usar los datos personales como datos de empresa
        if (body.isAutonomo) {
            // Verificar que el usuario tiene datos personales completos
            if (!user.name || !user.surname || !user.nif) {
                return res.status(400).send({ 
                    error: 'Se requieren datos personales para trabajadores autónomos. Por favor, actualice primero los datos personales.'
                });
            }
            
            // Actualizar con los datos personales como datos de empresa
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
        
        // Eliminar campos sensibles antes de devolver la respuesta
        updatedUser.set('password', undefined, {strict: false});
        updatedUser.set('verificationCode', undefined, {strict: false});
        
        // Devolver el usuario actualizado
        res.status(200).send({
            message: 'Datos de empresa actualizados correctamente',
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_ACTUALIZAR_DATOS_DE_EMPRESA', 500);
    }
};

module.exports = { updatePersonalData, updateCompanyData };