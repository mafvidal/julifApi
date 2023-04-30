const { response } = require('express');

const sendRes = (res = response, data, status) => {
    try {
        res.type("application/json");
        const result = {
            status: "success",
            data
        };
        return res.status(status ? status : 200).json(result);
    } catch(err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

const sendErr = (res = response, message, code) => {
    try {
        const result = {
            status: "error",
            error: {
                message: message,
            },
        };

        return res.status(code ? code : 400).json(result);
    } catch(err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

module.exports = {
    sendRes: sendRes,
    sendErr: sendErr
}

