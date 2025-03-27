const { StorageModel } = require('../models/index');
const path = require('path');

const createItem = async (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    if (!req.file) {
        return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const data = await StorageModel.create({
        fileName: req.file.originalname,
        fileURL: `/storage/${req.file.filename}` // Ruta de almacenamiento
    });

    res.json({ data });
};


const updateLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('ERROR_NO_FILE_UPLOADED');
        }

        const fileURL = `/storage/${req.file.filename}`; // Ruta local

        // Guardar en la base de datos
        const data = await StorageModel.create({
            fileName: req.file.originalname,
            fileURL
        });

        res.status(200).json({
            success: true,
            message: 'Logo updated successfully',
            data
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('ERROR_UPLOAD_LOGO');
    }
};

module.exports = { createItem, updateLogo };
