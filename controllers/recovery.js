const { matchedData } = require('express-validator');
const { usersModel } = require('../models/index');
const { handleError } = require('../utils/handleError');
const { encrypt } = require('../utils/handlePassword');

/**
 * Función para solicitar la recuperación de contraseña
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const requestPasswordReset = async (req, res) => {
    try {
        // Obtener el email de la petición
        const { email } = matchedData(req);
        
        // Comprobar si el usuario existe en la base de datos
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        // Generar un código de recuperación aleatorio de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar el código en el usuario y establecer su tiempo de expiración
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 3600000; // 1 hora de validez
        await user.save();
        
        // En un caso real, enviaríamos un email con el código
        // Por ahora, lo devolvemos en la respuesta (solo para pruebas)
        res.status(200).send({ 
            message: 'Código de restablecimiento de contraseña enviado',
            resetCode // Solo para pruebas, no haría esto en producción
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_SOLICITAR_RESET_PASSWORD', 500);
    }
};

/**
 * Función para restablecer la contraseña con el código de recuperación
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const resetPassword = async (req, res) => {
    try {
        // Obtener los datos validados de la petición
        const { email, code, newPassword } = matchedData(req);
        
        // Buscar el usuario con el email y código de recuperación válido
        const user = await usersModel.findOne({ 
            email,
            resetCode: code,
            resetCodeExpires: { $gt: Date.now() } // Verificar que el código no ha expirado
        });
        
        // Verificar si el código es válido
        if (!user) {
            return res.status(400).send({ error: 'Código de recuperación inválido o expirado' });
        }
        
        // Cifrar la nueva contraseña
        const hashedPassword = await encrypt(newPassword);
        
        // Actualizar la contraseña y eliminar el código de recuperación
        user.password = hashedPassword;
        user.resetCode = undefined; // Eliminar el código
        user.resetCodeExpires = undefined; // Eliminar la fecha de expiración
        await user.save();
        
        // Enviar respuesta de éxito
        res.status(200).send({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_RESTABLECER_PASSWORD', 500);
    }
};

module.exports = { requestPasswordReset, resetPassword };