const {storageModel} = require('../models')
const {uploadToPinata} = require('../utils/handleUploadIPFS')

const createItem = async(req, res) =>{
    try {
        const fileBuffer= req.file.buffer;
        const fileName = req.file.originalname;
        const pinataResponse = await uploadToPinata(fileBuffer, fileName);
        // console.log('PINATA RESPONSE: ', pinataResponse)

        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        const data = await storageModel.create({fileURL:ipfs});

        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send('ERROR_UPLOAD_COMPANY_IMAGE');
    }
}

// Nueva función para actualizar el logo
const updateLogo = async(req, res) =>{
    try {
        if (!req.file) {
            return res.status(400).send('ERROR_NO_FILE_UPLOADED');
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const pinataResponse = await uploadToPinata(fileBuffer, fileName);

        const ipfsFile = pinataResponse.IpfsHash;
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;
        
        // Para el logo, guardamos también el nombre del archivo
        const data = await storageModel.create({
            fileName: fileName,
            fileURL: ipfs
        });

        res.status(200).json({
            success: true,
            message: 'Logo updated successfully',
            data: data
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('ERROR_UPLOAD_LOGO');
    }
}

module.exports = {createItem, updateLogo};