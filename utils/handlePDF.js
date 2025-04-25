// utils/handlePdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { uploadToPinata } = require('./handleUploadIPFS');

/**
 * Descarga una imagen desde una URL y la guarda temporalmente
 * @param {String} imageUrl - URL de la imagen
 * @returns {Promise<String>} - Ruta al archivo temporal
 */
const downloadAndSaveImage = async (imageUrl) => {
    try {
        // Crear directorio temporal si no existe
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generar nombre único para la imagen
        const imagePath = path.join(tempDir, `signature-${Date.now()}.jpg`);
        
        console.log(`Intentando descargar imagen desde: ${imageUrl}`);
        
        // Descargar la imagen
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer',
        });
        
        console.log(`Imagen descargada, guardando en: ${imagePath}`);
        
        // Guardar la imagen en el sistema de archivos
        fs.writeFileSync(imagePath, Buffer.from(response.data));
        
        return imagePath;
    } catch (error) {
        console.error('Error al descargar la imagen:', error.message);
        if (error.response) {
            console.error('Detalles de la respuesta:', error.response.status, error.response.statusText);
        }
        throw error;
    }
};

/**
 * Genera un PDF para un albarán
 * @param {Object} deliveryNote - Datos del albarán
 * @param {String} outputPath - Ruta donde guardar el PDF
 * @returns {Promise<String>} - Ruta del PDF generado
 */
const generateDeliveryNotePdf = async (deliveryNote, outputPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Crear un nuevo documento PDF
            const doc = new PDFDocument({ margin: 50 });
            
            // Stream para escribir el PDF a un archivo
            const writeStream = fs.createWriteStream(outputPath);
            
            // Redirigir el documento a la stream
            doc.pipe(writeStream);
            
            // Configurar información del documento
            doc.info.Title = `Albarán ${deliveryNote.number}`;
            doc.info.Author = 'Sistema de Gestión';
            
            // Título
            doc.fontSize(20).text('ALBARÁN', { align: 'center' });
            doc.moveDown();
            
            // Información del albarán
            doc.fontSize(12).text(`Número: ${deliveryNote.number}`, { align: 'left' });
            doc.text(`Fecha: ${new Date(deliveryNote.date).toLocaleDateString()}`, { align: 'left' });
            doc.moveDown();
            
            // Información del cliente
            doc.fontSize(14).text('CLIENTE', { align: 'left' });
            doc.fontSize(12).text(`Nombre: ${deliveryNote.clientId.name}`, { align: 'left' });
            if (deliveryNote.clientId.email) {
                doc.text(`Email: ${deliveryNote.clientId.email}`, { align: 'left' });
            }
            if (deliveryNote.clientId.address) {
                doc.text(`Dirección: ${deliveryNote.clientId.address}`, { align: 'left' });
            }
            doc.moveDown();
            
            // Información del proyecto
            doc.fontSize(14).text('PROYECTO', { align: 'left' });
            doc.fontSize(12).text(`Nombre: ${deliveryNote.projectId.name}`, { align: 'left' });
            if (deliveryNote.projectId.description) {
                doc.text(`Descripción: ${deliveryNote.projectId.description}`, { align: 'left' });
            }
            doc.text(`Estado: ${deliveryNote.projectId.status}`, { align: 'left' });
            doc.moveDown();
            
            // Descripción del albarán
            if (deliveryNote.description) {
                doc.fontSize(14).text('DESCRIPCIÓN', { align: 'left' });
                doc.fontSize(12).text(deliveryNote.description, { align: 'left' });
                doc.moveDown();
            }
            
            // Horas trabajadas
            if (deliveryNote.hoursEntries && deliveryNote.hoursEntries.length > 0) {
                doc.fontSize(14).text('HORAS TRABAJADAS', { align: 'left' });
                
                // Tabla para horas
                const tableTop = doc.y + 10;
                const tableLeft = 50;
                
                // Cabecera
                doc.fontSize(10)
                   .text('Usuario', tableLeft, tableTop)
                   .text('Horas', tableLeft + 150, tableTop)
                   .text('Fecha', tableLeft + 200, tableTop)
                   .text('Descripción', tableLeft + 280, tableTop);
                
                doc.moveTo(tableLeft, tableTop + 15)
                   .lineTo(tableLeft + 500, tableTop + 15)
                   .stroke();
                
                // Filas
                let rowTop = tableTop + 25;
                
                deliveryNote.hoursEntries.forEach((entry) => {
                    const userName = entry.userId?.name || 'N/A';
                    const hours = entry.hours?.toString() || 'N/A';
                    const date = entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A';
                    const description = entry.description || '';
                    
                    doc.fontSize(10)
                       .text(userName, tableLeft, rowTop)
                       .text(hours, tableLeft + 150, rowTop)
                       .text(date, tableLeft + 200, rowTop)
                       .text(description, tableLeft + 280, rowTop, { width: 220 });
                    
                    rowTop += 20 + (Math.ceil(description.length / 40) * 10); // Ajustar altura según el texto
                });
                
                doc.moveDown(2);
            }
            
            // Materiales
            if (deliveryNote.materialEntries && deliveryNote.materialEntries.length > 0) {
                doc.fontSize(14).text('MATERIALES', { align: 'left' });
                
                // Tabla para materiales
                const tableTop = doc.y + 10;
                const tableLeft = 50;
                
                // Cabecera
                doc.fontSize(10)
                   .text('Material', tableLeft, tableTop)
                   .text('Cantidad', tableLeft + 150, tableTop)
                   .text('Unidad', tableLeft + 220, tableTop)
                   .text('Precio', tableLeft + 280, tableTop)
                   .text('Descripción', tableLeft + 340, tableTop);
                
                doc.moveTo(tableLeft, tableTop + 15)
                   .lineTo(tableLeft + 500, tableTop + 15)
                   .stroke();
                
                // Filas
                let rowTop = tableTop + 25;
                
                deliveryNote.materialEntries.forEach((entry) => {
                    const name = entry.name || 'N/A';
                    const quantity = entry.quantity?.toString() || 'N/A';
                    const unit = entry.unit || 'unidad';
                    const price = entry.price ? `${entry.price.toFixed(2)} €` : 'N/A';
                    const description = entry.description || '';
                    
                    doc.fontSize(10)
                       .text(name, tableLeft, rowTop)
                       .text(quantity, tableLeft + 150, rowTop)
                       .text(unit, tableLeft + 220, rowTop)
                       .text(price, tableLeft + 280, rowTop)
                       .text(description, tableLeft + 340, rowTop, { width: 180 });
                    
                    rowTop += 20 + (Math.ceil(description.length / 30) * 10); // Ajustar altura según el texto
                });
                
                doc.moveDown(2);
            }
            
            // Sección de firma
            doc.moveDown();
            doc.fontSize(14).text('FIRMAS', { align: 'left' });
            
            // Si está firmado, mostrar la firma
            if (deliveryNote.signature && deliveryNote.signature.isSigned) {
                // Añadir imagen de firma si existe
                if (deliveryNote.signature.ipfsHash) {
                    try {
                        // Construir URL correcta para IPFS
                        const gateway = 'https://gateway.pinata.cloud';
                        const imageUrl = `${gateway}/ipfs/${deliveryNote.signature.ipfsHash}`;
                        
                        console.log(`Procesando imagen de firma desde IPFS: ${imageUrl}`);
                        
                        // Descargar la imagen primero
                        const localImagePath = await downloadAndSaveImage(imageUrl);
                        
                        console.log(`Imagen descargada localmente en: ${localImagePath}`);
                        
                        // Usar la imagen local en el PDF
                        doc.image(localImagePath, {
                            fit: [200, 100],
                            align: 'left'
                        });
                        
                        console.log(`Imagen incluida en el PDF`);
                        
                        // Eliminar la imagen temporal
                        fs.unlink(localImagePath, (err) => {
                            if (err) console.error('Error al eliminar imagen temporal:', err);
                            else console.log(`Imagen temporal eliminada: ${localImagePath}`);
                        });
                        
                    } catch (error) {
                        console.error('Error al incluir la imagen de firma:', error);
                        doc.text('(Imagen de firma no disponible)', { align: 'left' });
                    }
                }
                
                doc.moveDown();
                doc.fontSize(10).text(`Firmado por: ${deliveryNote.signature.signedBy || 'N/A'}`, { align: 'left' });
                doc.text(`Fecha de firma: ${new Date(deliveryNote.signature.date).toLocaleDateString()}`, { align: 'left' });
            } else {
                // Si no está firmado, dejar espacio para firma manual
                doc.moveDown();
                doc.fontSize(10).text('El albarán aún no ha sido firmado', { align: 'left' });
                
                // Línea para firma
                const signLineY = doc.y + 40;
                doc.moveTo(50, signLineY)
                   .lineTo(250, signLineY)
                   .stroke();
                
                // Texto debajo de la línea
                doc.text('Firma Cliente', 50, signLineY + 10);
            }
            
            // Pie de página
            const footerText = `Albarán generado el ${new Date().toLocaleString()}`;
            doc.fontSize(8)
               .text(footerText, 50, doc.page.height - 50, {
                   align: 'center',
                   width: doc.page.width - 100
               });
            
            // Finalizar documento
            doc.end();
            
            // Manejar eventos de la stream
            writeStream.on('finish', () => {
                resolve(outputPath);
            });
            
            writeStream.on('error', (err) => {
                reject(err);
            });
            
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Sube un PDF de albarán a IPFS
 * @param {String} pdfPath - Ruta al archivo PDF
 * @param {String} fileName - Nombre del archivo
 * @returns {Promise<Object>} - Datos de la respuesta de IPFS
 */
const uploadPdfToIPFS = async (pdfPath, fileName) => {
    try {
        // Leer el archivo PDF
        const fileBuffer = fs.readFileSync(pdfPath);
        
        // Subir a IPFS usando la función existente
        const ipfsResponse = await uploadToPinata(fileBuffer, fileName);
        
        return ipfsResponse;
    } catch (error) {
        console.error('Error al subir PDF a IPFS:', error);
        throw error;
    }
};

/**
 * Crear la URL completa para un hash de IPFS
 * @param {String} ipfsHash - Hash de IPFS
 * @returns {String} - URL completa
 */
const getIPFSUrl = (ipfsHash) => {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

module.exports = {
    generateDeliveryNotePdf,
    uploadPdfToIPFS,
    getIPFSUrl
};