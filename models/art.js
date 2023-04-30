const { Schema, model } = require('mongoose');
const mongoose = require("mongoose");

const ArtSchema = Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    date: {
        type: String,
    },
    show: {
        type: Boolean,
        required: true,
        default: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    images: [{
        id: {
            type: mongoose.Types.ObjectId
        },
        order: {
            type: Number
        },
        principal: {
            type: Boolean
        }
    }]
}, {timestamps: true});


module.exports = model( 'Art', ArtSchema );
