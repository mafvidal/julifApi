const { response } = require('express');
const { Art, Media} = require('../models');
const mongoose = require("mongoose");
const {sendRes, sendErr} = require("../helpers/responseHandler");
const cloudinary = require('cloudinary').v2

cloudinary.config(process.env.CLOUDINARY_URL);


const createArt = async(req, res = response ) => {
    try {
        const data = req.body;
        const category = data.category;
        await Art.updateMany({ category }, {$inc: {order: 1}});
        const art = new Art(data);
        await art.save();
        return sendRes(res, {art}, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const updateArt = async(req, res = response ) => {
    try {
        const data = req.body;
        const { id } = req.params;
        const art = await Art.findOneAndUpdate({_id: id}, {$set: {...data}});
        return sendRes(res, {art}, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const getArtById = async(req, res = response ) => {
    try {
        const { id } = req.params;
        const arts = await Art.aggregate([
            {
                "$match" : {
                    "_id" : mongoose.Types.ObjectId(id)
                }
            },
            {
                "$lookup" : {
                    "from" : "media",
                    "localField" : "images.id",
                    "foreignField" : "_id",
                    "as" : "media"
                }
            }
        ]);
        const art = arts[0];

        const images = art.images.map( image => {
            const media = art.media.find(m => m._id.toString() === image.id.toString());

            return {
                _id: image._id.toString(),
                id: image.id.toString(),
                order: image.order,
                principal: image.principal,
                url: media.url
            };
        }).sort((a, b) => a.order - b.order);

        const customArt = {
            _id: art._id.toString(),
            order: art.order,
            title: art.title,
            category: art.category,
            description: art.description,
            date: art.date,
            images: images,
        }

        return sendRes(res, { art: customArt }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const getArtPaginatedByCategory = async(req, res = response ) => {
    try {
        const { limit = 5, page = 0, category } = req.query;
        const query = { category }
        const [ total, arts ] = await Promise.all([
            Art.countDocuments(query),
            Art.aggregate([
                {
                    "$match" : {
                        "category" : category
                    }
                },
                {
                    "$sort" : {
                        "order" : 1
                    }
                },
                {
                    "$skip" : Number( page * limit )
                },
                {
                    "$limit" : Number( limit )
                },
                {
                    "$unwind" : {
                        "path" : "$images"
                    }
                },
                {
                    "$match" : {
                        "images.principal" : true
                    }
                },
                {
                    "$lookup" : {
                        "from" : "media",
                        "localField" : "images.id",
                        "foreignField" : "_id",
                        "as" : "media"
                    }
                },
                {
                    "$unwind" : {
                        "path" : "$media"
                    }
                }
            ])
        ]);

        const customArts = arts.map(art => ({
            _id: art._id.toString(),
            show: art.show,
            order: art.order,
            title: art.title,
            category: art.category,
            description: art.description,
            date: art.date,
            image: art.media.url
        }));

        return sendRes(res, {
            total,
            arts: customArts
        }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const getArtByCategory = async(req, res = response ) => {
    try {
        const { category } = req.query;
        const arts = await Art.aggregate([
            {
                "$match" : {
                    "category" : category
                }
            },
            {
                "$sort" : {
                    "order" : 1
                }
            },
            {
                "$lookup" : {
                    "from" : "media",
                    "localField" : "images.id",
                    "foreignField" : "_id",
                    "as" : "media"
                }
            }
        ]);

        const customArts = arts.map(art => {
            let principal = "";
            const images = art.images.map( image => {
                const media = art.media.find(m => m._id.toString() === image.id.toString());
                if (image.principal) {
                    principal = media.url;
                }
                return {
                    order: image.order,
                    url: media.url
                };
            }).sort((a, b) => a.order - b.order);
            return {
                _id: art._id.toString(),
                show: art.show,
                order: art.order,
                title: art.title,
                category: art.category,
                description: art.description,
                date: art.date,
                images: images,
                principal: principal
            };
        });

        return sendRes(res, { arts: customArts }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const changeShowArt = async(req, res = response ) => {
    try {
        const { id } = req.params;
        const initialArt = await Art.findById(id);
        const query = { _id: id }
        await Art.findOneAndUpdate(query, {$set: { show: !initialArt.show }});
        return sendRes(res, { message: "Obra modificada" }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const deleteArt = async(req, res = response ) => {
    try {
        const { id } = req.params;
        const query = { _id: id };
        const art = await Art.findById(id);
        await Art.deleteOne(query);
        for (const mediaArt of art.images ) {
            const media = await Media.findById(mediaArt.id);
            await Media.deleteOne({_id: id});
            const filePath = media.url.split('/');
            const fileName = filePath[filePath.length - 1];
            const [ public_id ] = fileName.split('.');
            await cloudinary.uploader.destroy(public_id);
        }
        return sendRes(res, { message: "Obra eliminada" }, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

const changeOrder = async(req, res = response ) => {
    try {
        const { id } = req.params;
        const { category, newOrder, lastOrder } = req.body;
        if (newOrder < lastOrder) {
            await Art.updateMany({category, order: {$lt: lastOrder, $gte: newOrder}}, {$inc: {order: 1}});
        } else {
            await Art.updateMany({category, order: {$lte: newOrder, $gt: lastOrder}}, {$inc: {order: -1}});
        }
        await Art.updateOne({_id: id}, {$set: {order: newOrder}});
        return sendRes(res, { message: "Orden modificado"}, 201);
    } catch (error) {
        return sendErr(res, 'error en el servidor', 500);
    }
}

module.exports = {
    createArt,
    updateArt,
    getArtById,
    getArtPaginatedByCategory,
    getArtByCategory,
    changeShowArt,
    deleteArt,
    changeOrder
}
