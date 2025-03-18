const { usersModel } = require('../models');
const { handleError } = require('../utils/handleError');
const { matchedData } = require('express-validator');

const getUsers = async (req, res) => {

    try {
        const data = await tracksModel.find({});
        res.send({ data });
    } catch (error) {
        handleError(res, 'ERROR_GET_ITEMS');
    }
}

const getUser = async (req, res) => {
    const { id } = req.params;
    res.send({ message: 'Devolviendo usuario...' }, id);
}


const createUser = async (req, res) => {
    try {
        const { body } = matchedData(req);

        const data = await usersModel.create(body);
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_CREATE_ITEMS');
    }
}


const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { body } = matchedData(req);
        const data = await usersModel.findOneAndUpdate({ _id: id }, body, { new: true });
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_UPDATE_ITEMS');
    }
}


const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role  = req.user.role;
        const data = await usersModel.findOneAndUpdate({ _id: id }, { role }, { new: true });
        res.json({ data });
    } catch (error) {
        handleError(res, 'ERROR_UPDATE_ROLE');
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const data = await usersModel.findOneAndDelete(id);

    res.json({ data });
}

const getMe = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Buscar el usuario en la base de datos
        const user = await usersModel.findById(_id);
        
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        // Eliminar campos sensibles
        user.set('password', undefined, {strict: false});
        user.set('verificationCode', undefined, {strict: false});
        
        res.status(200).send({ user });
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_GET_USER', 500);
    }
};

const deleteAccount = async (req, res) => {
    try {
        // Obtener el ID del usuario del token JWT
        const { _id } = req.user;
        
        // Obtener el parámetro de consulta soft
        const softDelete = req.query.soft !== 'false';
        
        if (softDelete) {
            // Soft delete: marcar al usuario como inactivo
            await usersModel.findByIdAndUpdate(_id, { active: false });
            res.status(200).send({ message: 'Account deactivated successfully' });
        } else {
            // Hard delete: eliminar el usuario de la base de datos
            await usersModel.findByIdAndDelete(_id);
            res.status(200).send({ message: 'Account deleted permanently' });
        }
    } catch (error) {
        console.log(error);
        handleError(res, 'ERROR_DELETE_USER', 500);
    }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, updateRole, getMe, deleteAccount };