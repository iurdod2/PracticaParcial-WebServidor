const { usersModel } = require('../models/index');
const { handleError } = require('../utils/handleError');
const { matchedData } = require('express-validator');

/**
 * Función para obtener todos los usuarios
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const getUsers = async (req, res) => {
    try {
        // Obtener todos los usuarios de la base de datos
        const data = await tracksModel.find({});
        res.send({ data });
    } catch (error) {
        handleError(res, 'ERROR_AL_OBTENER_USUARIOS');
    }
}

/**
 * Función para obtener un usuario específico por ID
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const getUser = async (req, res) => {
    // Obtener el ID del usuario de los parámetros de la ruta
    const { id } = req.params;
    res.send({ message: 'Devolviendo usuario...' }, id);
}

/**
 * Función para crear un nuevo usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const createUser = async (req, res) => {
    try {
        // Obtener datos validados del cuerpo de la petición
        const { body } = matchedData(req);

        // Crear el usuario en la base de datos
        const data = await usersModel.create(body);
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_AL_CREAR_USUARIO');
    }
}

/**
 * Función para actualizar un usuario existente
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const updateUser = async (req, res) => {
    try {
        // Obtener el ID del usuario de los parámetros de la ruta
        const { id } = req.params;
        // Obtener datos validados del cuerpo de la petición
        const { body } = matchedData(req);
        
        // Actualizar el usuario en la base de datos
        const data = await usersModel.findOneAndUpdate({ _id: id }, body, { new: true });
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_AL_ACTUALIZAR_USUARIO');
    }
}

/**
 * Función para actualizar el rol de un usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const updateRole = async (req, res) => {
    try {
        // Obtener el ID del usuario de los parámetros de la ruta
        const { id } = req.params;
        // Obtener el rol del usuario autenticado
        const role = req.user.role;
        
        // Actualizar el rol del usuario en la base de datos
        const data = await usersModel.findOneAndUpdate({ _id: id }, { role }, { new: true });
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_AL_ACTUALIZAR_ROL');
    }
}

/**
 * Función para eliminar un usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const deleteUser = async (req, res) => {
    // Obtener el ID del usuario de los parámetros de la ruta
    const { id } = req.params;
    // Eliminar el usuario de la base de datos
    const data = await usersModel.findOneAndDelete(id);

    res.json({ data });
}

/**
 * Función para obtener los datos del usuario autenticado
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const getMe = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario en la base de datos
        const user = await usersModel.findById(_id);
        
        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }
        
        // Eliminar campos sensibles antes de devolver la respuesta
        user.set('password', undefined, {strict: false});
        user.set('verificationCode', undefined, {strict: false});
        
        // Devolver los datos del usuario
        res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_OBTENER_USUARIO', 500);
    }
};

/**
 * Función para eliminar o desactivar la cuenta del usuario
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 */
const deleteAccount = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Obtener el parámetro de consulta soft (borrado lógico o físico)
        const softDelete = req.query.soft !== 'false';
        
        if (softDelete) {
            // Soft delete: marcar al usuario como inactivo
            await usersModel.findByIdAndUpdate(_id, { active: false });
            res.status(200).send({ message: 'Cuenta desactivada correctamente' });
        } else {
            // Hard delete: eliminar el usuario de la base de datos
            await usersModel.findByIdAndDelete(_id);
            res.status(200).send({ message: 'Cuenta eliminada permanentemente' });
        }
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_AL_ELIMINAR_USUARIO', 500);
    }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, updateRole, getMe, deleteAccount };