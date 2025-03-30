const { matchedData } = require('express-validator');
const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');
const { tokenSign } = require('../utils/handleJwt');
const { encrypt } = require('../utils/handlePassword');

/**
 * Función para invitar a un usuario al sistema
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const inviteUser = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario que envía la invitación
        const inviter = await usersModel.findById(_id);
        
        // Verificar que el usuario tiene una compañía
        if (!inviter.companyName) {
            return res.status(400).send({ error: 'Debes tener datos de empresa para invitar a usuarios' });
        }
        
        // Generar un código de invitación único
        const invitationCode = Math.random().toString(36).substring(2, 12);
        
        // Crear un nuevo usuario con role guest (invitado)
        const newUser = new usersModel({
            role: 'guest',
            verified: false,
            invitationCode,
            invitedBy: _id,
            companyName: inviter.companyName,
            active: true
        });
        
        // Guardar el nuevo usuario en la base de datos
        await newUser.save();
        
        // Devolver información de la invitación
        res.status(200).send({ 
            message: 'Invitación creada',
            invitationCode, // Código para aceptar la invitación
            userId: newUser._id // ID del usuario invitado
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_INVITAR_USUARIO', 500);
    }
};

/**
 * Función para aceptar una invitación
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const acceptInvitation = async (req, res) => {
    try {
        // Obtener datos validados de la petición
        const { code, userId, password } = matchedData(req);
        
        // Buscar el usuario con el código de invitación
        const user = await usersModel.findOne({ 
            _id: userId, 
            invitationCode: code,
            role: 'guest' 
        });
        
        // Verificar si la invitación es válida
        if (!user) {
            return res.status(400).send({ error: 'Código de invitación inválido' });
        }
        
        // Cifrar la contraseña
        const hashedPassword = await encrypt(password);
        
        // Actualizar el usuario con los nuevos datos
        user.password = hashedPassword;
        user.verified = true;
        user.role = 'user'; // Cambiar de guest a user
        user.invitationCode = undefined; // Eliminar el código de invitación
        
        // Guardar los cambios
        await user.save();
        
        // Generar token JWT para la sesión
        const token = tokenSign(user);
        
        // Devolver información del usuario y token
        res.status(200).send({
            message: 'Invitación aceptada',
            token,
            user: {
                _id: user._id,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_ACEPTAR_INVITACION', 500);
    }
};

module.exports = { inviteUser, acceptInvitation };