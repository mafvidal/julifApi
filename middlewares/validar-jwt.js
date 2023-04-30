const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const {User} = require("../models");

const validarJWT = async( req = request, res = response, next ) => {

    const token = req.header('token');

    if ( !token ) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {

        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );

        req.context = {uid};
        next();

    } catch (error) {

        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

}




module.exports = {
    validarJWT
}
