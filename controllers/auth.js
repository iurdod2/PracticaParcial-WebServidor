const express = require('express');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { usersModel } = require('../models/index');
const { tokenSign, verifyToken } = require('../utils/handleJwt');
const { handleError } = require('../utils/handleError');

const register = async(req, res) => {
    try {
        req = matchedData(req);
        
        // Verificar si ya existe un usuario con ese email y está verificado
        const existingUser = await usersModel.findOne({ email: req.email, verified: true });
        if (existingUser) {
            return res.status(409).send({ error: 'Email already exists and is verified' });
        }
        
        // Generar código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Cifrar la contraseña
        const password = await encrypt(req.password);
        
        // Crear el usuario
        const body = {
            ...req, 
            password,
            verificationCode,
            verificationAttempts: 0,
            maxVerificationAttempts: 3,
            verified: false
        };
        
        const dataUser = await usersModel.create(body);
        dataUser.set('password', undefined, {strict: false});
        dataUser.set('verificationCode', undefined, {strict: false});
        
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
        handleError(res, 'ERROR_REGISTER_USER');
    }
};

const login = async (req, res) => {
    try {
        req = matchedData(req);
        
        // Buscar usuario por email
        const user = await usersModel.findOne({ email: req.email });
        
        // Si no existe el usuario, devolver error 404
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        // Verificar si el email está validado
        if (!user.verified) {
            return res.status(403).send({ error: 'Email not verified' });
        }
        
        // Comparar contraseña
        const isPasswordValid = await compare(req.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Invalid credentials' });
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
        handleError(res, 'ERROR_LOGIN_USER', 500);
    }
};

const validateEmail = async (req, res) => {
    try {
        // Obtener el código del cuerpo de la petición
        const { code } = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario en la base de datos
        const user = await usersModel.findById(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        // Verificar si el usuario ya está verificado
        if (user.verified) {
            return res.status(409).send({ error: 'Email already verified' });
        }
        
        // Verificar si ha excedido el número máximo de intentos
        if (user.verificationAttempts >= user.maxVerificationAttempts) {
            return res.status(429).send({ error: 'Maximum verification attempts exceeded' });
        }
        
        // Verificar el código
        if (user.verificationCode !== code) {
            // Incrementar el contador de intentos fallidos
            user.verificationAttempts += 1;
            await user.save();
            
            return res.status(400).send({ 
                error: 'Invalid verification code',
                attemptsLeft: user.maxVerificationAttempts - user.verificationAttempts
            });
        }
        
        // Si el código es correcto, actualizar el estado del usuario
        user.verified = true;
        user.verificationCode = undefined; // Ya no necesitamos el código
        await user.save();
        
        // Devolver un mensaje de éxito
        return res.status(200).send({ message: 'Email verified successfully' });
        
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_VALIDATING_EMAIL');
    }
};

module.exports = { login, register, validateEmail };