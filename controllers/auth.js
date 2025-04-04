const express = require('express');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models/index');
const { tokenSign, verifyToken } = require('../utils/handleJwt');
const { handleError } = require('../utils/handleError');
const { sendEmail } = require('../utils/handleEmail');

/**
 * Función para registrar un nuevo usuario en el sistema
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const register = async(req, res) => {
    try {
        // Obtener datos validados de la petición
        req = matchedData(req);
        
        // Verificar si ya existe un usuario con ese email y está verificado
        const existingUser = await usersModel.findOne({ email: req.email, verified: true });
        if (existingUser) {
            return res.status(409).send({ error: 'El email ya existe y está verificado' });
        }
        
        // Generar código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Cifrar la contraseña
        const password = await encrypt(req.password);
        
        // Crear el usuario con todos los datos necesarios
        const body = {
            ...req, 
            password,
            verificationCode,
            verificationAttempts: 0,
            maxVerificationAttempts: 3,
            verified: false
        };
        
        // Guardar el usuario en la base de datos
        const dataUser = await usersModel.create(body);
        
        // Enviar correo con código de verificación
        await sendEmail({
            to: dataUser.email,
            from: process.env.EMAIL,
            subject: 'Código de verificación para tu cuenta',
            text: `Tu código de verificación es: ${verificationCode}. Utiliza este código para verificar tu cuenta.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Verifica tu cuenta</h2>
                    <p>Gracias por registrarte. Para completar el proceso de registro, utiliza el siguiente código de verificación:</p>
                    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p>Este código expirará en 24 horas.</p>
                    <p>Si no has solicitado esta cuenta, puedes ignorar este correo.</p>
                </div>
            `
        });
        
        // Eliminar datos sensibles antes de devolver la respuesta
        dataUser.set('password', undefined, {strict: false});
        dataUser.set('verificationCode', undefined, {strict: false});
        
        // Preparar datos para la respuesta
        const data = {
            token: tokenSign(dataUser),
            user: {
                email: dataUser.email,
                status: dataUser.verified,
                role: dataUser.role
            }
        }
        
        res.send(data);
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_REGISTRAR_USUARIO');
    }
};

/**
 * Función para iniciar sesión en el sistema
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const login = async (req, res) => {
    try {
        // Obtener datos validados de la petición
        req = matchedData(req);
        
        // Buscar usuario por email
        const user = await usersModel.findOne({ email: req.email });
        
        // Si no existe el usuario, devolver error 404
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el email está validado
        if (!user.verified) {
            return res.status(403).send({ error: 'Email no verificado' });
        }
        
        // Comparar contraseña
        const isPasswordValid = await compare(req.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Credenciales inválidas' });
        }
        
        // No enviar la contraseña en la respuesta
        user.set('password', undefined, {strict: false});
        
        // Generar token JWT
        const token = tokenSign(user);
        
        // Devolver datos del usuario y token
        const data = {
            token,
            user: {
                email: user.email,
                role: user.role,
                verified: user.verified
            }
        };
        
        res.send(data);
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_INICIAR_SESION', 500);
    }
};

/**
 * Función para reenviar el código de verificación
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const resendVerificationCode = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario en la base de datos
        const user = await usersModel.findById(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el usuario ya está verificado
        if (user.verified) {
            return res.status(409).send({ error: 'Email ya verificado' });
        }
        
        // Generar nuevo código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Actualizar el código en la base de datos
        user.verificationCode = verificationCode;
        user.verificationAttempts = 0; // Reiniciar intentos
        await user.save();
        
        // Enviar correo con el nuevo código
        await sendEmail({
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Nuevo código de verificación para tu cuenta',
            text: `Tu nuevo código de verificación es: ${verificationCode}. Utiliza este código para verificar tu cuenta.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Nuevo código de verificación</h2>
                    <p>Has solicitado un nuevo código de verificación. Utiliza el siguiente código:</p>
                    <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p>Este código expirará en 24 horas.</p>
                </div>
            `
        });
        
        return res.status(200).send({ message: 'Código de verificación reenviado correctamente' });
        
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_REENVIAR_CODIGO');
    }
};

/**
 * Función para validar el email del usuario mediante un código
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const validateEmail = async (req, res) => {
    try {
        // Obtener el código del cuerpo de la petición
        const { code } = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario en la base de datos
        const user = await usersModel.findById(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el usuario ya está verificado
        if (user.verified) {
            return res.status(409).send({ error: 'Email ya verificado' });
        }
        
        // Verificar si ha excedido el número máximo de intentos
        if (user.verificationAttempts >= user.maxVerificationAttempts) {
            return res.status(429).send({ error: 'Número máximo de intentos de verificación excedido' });
        }
        
        // Verificar el código
        if (user.verificationCode !== code) {
            // Incrementar el contador de intentos fallidos
            user.verificationAttempts += 1;
            await user.save();
            
            return res.status(400).send({ 
                error: 'Código de verificación inválido',
                attemptsLeft: user.maxVerificationAttempts - user.verificationAttempts
            });
        }
        
        // Si el código es correcto, actualizar el estado del usuario
        user.verified = true;
        user.verificationCode = undefined; // Ya no necesitamos el código
        await user.save();
        
        // Enviar correo de confirmación
        await sendEmail({
            to: user.email,
            from: process.env.EMAIL,
            subject: '¡Tu cuenta ha sido verificada!',
            text: `¡Felicidades! Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión y disfrutar de todos los servicios.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>¡Verificación completada!</h2>
                    <p>¡Felicidades! Tu cuenta ha sido verificada correctamente.</p>
                    <p>Ya puedes iniciar sesión y disfrutar de todos los servicios.</p>
                </div>
            `
        });
        
        // Devolver un mensaje de éxito
        return res.status(200).send({ message: 'Email verificado correctamente' });
        
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_VALIDAR_EMAIL');
    }
};

module.exports = { login, register, validateEmail, resendVerificationCode };