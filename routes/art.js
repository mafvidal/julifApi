const { Router } = require('express');
const { check, query, param } = require('express-validator');

const { validarJWT, validarCampos } = require('../middlewares');

const {
    createArt,
    updateArt,
    getArtById,
    getArtPaginatedByCategory,
    getArtByCategory,
    changeShowArt,
    deleteArt,
    changeOrder
} = require('../controllers/art');

const router = Router();

/**
 * {{url}}/api/categorias
 */

router.get('/', [
    validarJWT,
    query('category', 'La categoria es obligatoria').not().isEmpty(),
    validarCampos
], getArtPaginatedByCategory );

router.get('/all',[
    query('category', 'La categoria es obligatoria').not().isEmpty(),
    validarCampos
], getArtByCategory );

router.get('/:id', [
    validarJWT,
    param('id', 'El id es obligatorio').isMongoId(),
    validarCampos
], getArtById );

router.put('/:id', [
    validarJWT,
    param('id', 'El id es obligatorio').isMongoId(),
    check('title', 'El titulo es obligatorio').not().isEmpty(),
    check('category', 'La categoria es obligatoria').not().isEmpty(),
    check('images', 'Las imagenes son obligatorias').not().isEmpty(),
    validarCampos
], updateArt );

router.put('/show/:id', [
    validarJWT,
    param('id', 'El id es obligatorio').isMongoId(),
    validarCampos
], changeShowArt );

router.put('/order/:id', [
    validarJWT,
    param('id', 'El id es obligatorio').isMongoId(),
    check('category', 'La categoria es obligatoria').not().isEmpty(),
    check('newOrder', 'El orden es obligatorio').isNumeric(),
    check('lastOrder', 'El orden es obligatorio').isNumeric(),
    validarCampos
], changeOrder );

router.post('/', [
    validarJWT,
    check('title', 'El titulo es obligatorio').not().isEmpty(),
    check('category', 'La categoria es obligatoria').not().isEmpty(),
    check('images', 'Las imagenes son obligatorias').not().isEmpty(),
    validarCampos
], createArt );

router.delete('/:id', [
    validarJWT,
    param('id', 'El id es obligatorio').isMongoId(),
    validarCampos
], deleteArt );


module.exports = router;
