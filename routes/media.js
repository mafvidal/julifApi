const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT } = require('../middlewares');

const { getMedia, uploadMedia, removeMedia } = require('../controllers/media');

const router = Router();

router.get('/:id', getMedia );

router.post('/upload', [
    validarJWT
], uploadMedia );

router.put('/', [
    validarJWT,
    check('ids', 'Los ids son obligatorios').not().isEmpty(),
], removeMedia)

module.exports = router;
