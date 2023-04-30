const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;

        this.paths = {
            auth: '/api/auth',
            art: '/api/art',
            media: '/api/media'
        }

        this.connectDB();
        this.middlewares();
        this.routes();
        this.handleExceptions();
    }

    async connectDB() {
        await dbConnection();
    }


    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            limits: { fileSize: 10 * 1024 * 1024 }
        }));

    }

    routes() {
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.art, require('../routes/art'));
        this.app.use( this.paths.media, require('../routes/media'));
    }

    handleExceptions() {
        process.on('unhandledRejection', (reason, promise) => {
            throw reason;
        });

        process.on('uncaughtException', (error) => {
            console.log("Error");
        });
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Server running in port', this.port );
        });
    }

}




module.exports = Server;
