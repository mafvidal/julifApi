const { response } = require('express');
const { Media } = require('../models');
const path = require('path');
const {sendRes, sendErr} = require("../helpers/responseHandler");
const cloudinary = require('cloudinary').v2

cloudinary.config(process.env.CLOUDINARY_URL);

const UPLOADING = 'uploading';
const UPLOADED = 'uploaded';

const getMedia = async (req, res = response ) => {
    try {
        const { id } = req.params;
        const media = await Media.findById(id);
        if (!media) {
            return sendRes(res, {url: null}, 201);
        }
        return sendRes(res, {url: media.url}, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const uploadMedia = async (req, res = response ) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return res.status(400).json({message: 'No hay archivos en la petición.'});
        }

        const { file } = req.files;

        const cutName = file.name.split(".");
        const ext = cutName[cutName.length - 1];

        const media = new Media({ state: UPLOADING, ext });
        await media.save();

        const id = media._id;
        const { tempFilePath } = file;
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath);
        await Media.findOneAndUpdate({_id: media._id}, {$set: {state: UPLOADED, url: secure_url}});

        sendRes(res, { mediaId: id.toString() }, 201);

    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const removeMedia = async (req, res = response ) => {
    try {
        const { ids } = req.body;
        const medias = await Media.find({_id: {$in: ids}});
        sendRes(res, { message: "Medias deleted" }, 201);
        try {
            for (const media of medias) {
                await Media.deleteOne({_id: media._id});
                const filePath = media.url.split('/');
                const fileName = filePath[filePath.length - 1];
                const [ public_id ] = fileName.split('.');
                cloudinary.uploader.destroy(public_id);
            }
        } catch (e) {
            console.log("Error to remove medias")
        }
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

module.exports = {
    getMedia,
    uploadMedia,
    removeMedia
}
