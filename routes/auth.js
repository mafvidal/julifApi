const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { login, getUser, register } = require('../controllers/auth');
const { validarJWT } = require("../middlewares");

const router = Router();

router.post('/login',[
    check('username', 'El username es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], login );

router.get('/user',[
    validarJWT
], getUser );

// router.post('/register',[
//     check('username', 'El username es obligatorio').not().isEmpty(),
//     check('name', 'El nombre es obligatorio').not().isEmpty(),
//     check('password', 'La contraseña es obligatoria').not().isEmpty(),
//     validarCampos
// ], register );

module.exports = router;
