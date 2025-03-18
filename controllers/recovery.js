const { matchedData } = require('express-validator');
const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');
const { encrypt } = require('../utils/handlePassword');

// Solicitar recuperación de contraseña
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = matchedData(req);
        
        // Comprobar si el usuario existe
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        // Generar un código de recuperación
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardar el código en el usuario
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 3600000; // 1 hora
        await user.save();
        
        // En un caso real, enviaríamos un email con el código
        // Por ahora, lo devolvemos en la respuesta (solo para pruebas)
        res.status(200).send({ 
            message: 'Password reset code sent',
            resetCode // Solo para pruebas, no haría esto en producción
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_REQUEST_PASSWORD_RESET', 500);
    }
};

// Restablecer la contraseña con el código
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = matchedData(req);
        
        // Buscar el usuario
        const user = await usersModel.findOne({ 
            email,
            resetCode: code,
            resetCodeExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).send({ error: 'Invalid or expired reset code' });
        }
        
        // Cifrar la nueva contraseña
        const hashedPassword = await encrypt(newPassword);
        
        // Actualizar la contraseña y eliminar el código de recuperación
        user.password = hashedPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();
        
        res.status(200).send({ message: 'Password reset successfully' });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_RESET_PASSWORD', 500);
    }
};

module.exports = { requestPasswordReset, resetPassword };