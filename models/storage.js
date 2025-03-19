const mongoose = require('mongoose');

const StorageModel = new mongoose.Schema({
    fileName: String,
    fileURL: String,
})

module.exports = mongoose.model('storage', StorageModel);