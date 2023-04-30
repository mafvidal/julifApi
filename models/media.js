const { Schema, model } = require('mongoose');

const MediaSchema = Schema({
    url: {
        type: String
    },
    state: {
        type: String
    }
}, {timestamps: true});


module.exports = model( 'Media', MediaSchema );
