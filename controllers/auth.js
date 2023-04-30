const { response } = require('express');
const bcryptjs = require('bcryptjs')

const User = require('../models/user');

const { generateJWT } = require('../helpers/generateJwt');
const {sendRes, sendErr} = require("../helpers/responseHandler");

const login = async(req, res = response) => {

    const { username, password } = req.body;

    try {

        // Verificar si el email existe
        const user = await User.findOne({ username });
        if ( !user ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, user.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // Generar el JWT
        const token = await generateJWT( user._id );

        return sendRes(res, { user: {_id: user._id.toString(), username: user.username, name: user.name}, token }, 201);

    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }

}

const getUser = async (req, res = response) => {
    try {
        const uid = req.context.uid;
        // Verificar si el email existe
        const user = await User.findOne({ _id: uid });
        if ( !user ) {
            return res.status(400).json({
                msg: 'Usuario incorreo'
            });
        }

        return sendRes(res, { user: {_id: user._id.toString(), username: user.username, name: user.name} }, 201);

    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const register = async(req, res = response) => {

    const {username, password, name} = req.body;
    try {

        const salt = bcryptjs.genSaltSync(10);
        const hash = bcryptjs.hashSync( password, salt);
        const user = new User({username, password: hash, name});
        await user.save();

        return sendRes(res, { user }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

module.exports = {
    login,
    getUser,
    register
}
