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


module.exports = { getUsers, getUser, createUser, updateUser, deleteUser, updateRole };