const express = require('express');
const {matchedData} = require('express-validator');
const {encrypt, compare} = require('../utils/handlePassword');
const {usersModel} = require('../models');
const {tokenSign, verifyToken} = require('../utils/handleJwt')

const register =  async(req, res) =>{
    req = matchedData(req);
    const password = await encrypt(req.password);
    const body = {...req, password};
    const dataUser = await usersModel.create(body);
    dataUser.set('password', undefined, {strict: false});

    const data ={
        token: tokenSign(dataUser),
        user: dataUser
    }
    res.send(data);
};

const login = async (req, res) => {
    req = matchedData(req);
    const dataUser = await usersModel.findOne({ email: req.email });

    if(!compare(req.password, dataUser.password)){
        return res.status(401).send({ error: 'The password is invalid.' });
    }

    const data = {
        token: tokenSign(dataUser),
        user: dataUser
    };

    res.send(data);
};


module.exports = {login, register};