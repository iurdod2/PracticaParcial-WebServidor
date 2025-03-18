// Crear un nuevo archivo controllers/invitations.js

const { matchedData } = require('express-validator');
const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');
const { tokenSign } = require('../utils/handleJwt');

const inviteUser = async (req, res) => {
    try {
        const { email } = matchedData(req);
        
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario que envía la invitación
        const inviter = await usersModel.findById(_id);
        
        // Verificar que el usuario tiene una compañía
        if (!inviter.companyName) {
            return res.status(400).send({ error: 'You must have company data to invite users' });
        }
        
        // Comprobar si el usuario ya está registrado
        const existingUser = await usersModel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ error: 'User already registered' });
        }
        
        // Generar un código de invitación
        const invitationCode = Math.random().toString(36).substring(2, 15);
        
        // Crear un nuevo usuario con role guest
        const newUser = new usersModel({
            email,
            role: 'guest',
            verified: false,
            invitationCode,
            invitedBy: _id,
            companyName: inviter.companyName,
            active: true
        });
        
        await newUser.save();
        
        // En un caso real, enviaríamos un email con el enlace de invitación
        // Por ahora, lo devolvemos en la respuesta (solo para pruebas)
        res.status(200).send({ 
            message: 'Invitation sent',
            invitationCode, // Solo para pruebas, no haría esto en producción
            invitationLink: `http://localhost:3000/register?code=${invitationCode}&email=${email}`
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_INVITE_USER', 500);
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const { code, email, password } = matchedData(req);
        
        // Buscar el usuario con el código de invitación
        const user = await usersModel.findOne({ email, invitationCode: code });
        
        if (!user) {
            return res.status(400).send({ error: 'Invalid invitation code' });
        }
        
        // Cifrar la contraseña
        const hashedPassword = await encrypt(password);
        
        // Actualizar el usuario
        user.password = hashedPassword;
        user.verified = true;
        user.invitationCode = undefined;
        
        await user.save();
        
        // Generar token JWT
        const token = tokenSign(user);
        
        res.status(200).send({
            message: 'Invitation accepted',
            token,
            user: {
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_ACCEPT_INVITATION', 500);
    }
};

module.exports = { inviteUser, acceptInvitation };