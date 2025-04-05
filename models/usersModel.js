const { request } = require("express");
const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "l'email est requis!"],
        trim: true,
        unique: [true, "l'email est déjà utilisé"],
        minLength: [true, "l'email doit avoir au moins 5 caractères!"],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "le mot de passe est requis!"],
        trim: true,
        select: false,

    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false,
    },
    forgotPasswordCode: {
        type: String,
        select: false,
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
    }
}, {

    timestamps: true

});
module.exports = mongoose.model('User', userSchema)