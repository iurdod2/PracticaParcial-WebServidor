const pinataURL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
require('dotenv').config();


const uploadToPinata = async(fileBuffer, fileName) =>{
    let data = new FormData();
    const blob = new Blob([fileBuffer]);
    const metadata = JSON.stringify({name:fileName});
    const options = JSON.stringify({cidVersion:1}); //cidVersion: versión de documento

    //le añadimos un blob con el  fichero y con la clave 'file', que es la que espera pinata
    data.append('file', blob, fileName); 
    data.append('pinataMetadata', metadata);
    data.append('pinataOptions', options);
    // console.log('DATA: ', data);
    
    try {
        const pinataApiKey = process.env.PINATA_KEY;
        const pinataSecretApiKey = process.env.PINATA_SECRET;
        const response = await fetch(pinataURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            },
            body: data
        });

        if (!response.ok){
            throw new Error('Error al subir el archivo a IPFS: ', response.statusText);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error al subir el archivo a IPFS: ', error);
        throw new Error('Error al subir el archivo a IPFS: ', error);
    }
}

module.exports = {uploadToPinata};