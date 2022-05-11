const mongoose = require('mongoose')


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};
const isValidNumber = function (number) {
    if (typeof number === NaN || number === 0  ) return false;
    return true
}

const isValidRequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

module.exports = { isValid , isValidNumber, isValidRequestBody, isValidObjectId }