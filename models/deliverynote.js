// models/deliverynote.js
const mongoose = require('mongoose');

// Esquema para las entradas de horas
const HoursEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// Esquema para las entradas de materiales
const MaterialEntrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: 'unidad'
    },
    price: {
        type: Number,
        min: 0
    },
    description: {
        type: String
    }
}, { _id: false });

// Esquema principal del albarán
const DeliveryNoteSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'projects',
            required: true
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'clients',
            required: true
        },
        number: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        description: {
            type: String
        },
        // El albarán puede contener horas, materiales, o ambos
        hoursEntries: [HoursEntrySchema],
        materialEntries: [MaterialEntrySchema],
        // Campo para saber si es un albarán simple (una sola entrada) o múltiple
        isSimple: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'approved', 'invoiced'],
            default: 'draft'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);