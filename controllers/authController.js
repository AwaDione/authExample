const { date } = require("joi");
const { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema,accepFPCodeSchema } = require("../middlewares/validator");
const User = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const jwt = require('jsonwebtoken');
const transport = require('../middlewares/sendMail');

//inscription
exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(401).json({ success: false, message: "l'utilisateur existe déjà!" })
        }

        const hashedPassword = await doHash(password, 12)
        const newUser = new User({
            email,
            password: hashedPassword
        })
        const result = await newUser.save();
        result.password = undefined
        res.status(201).json({
            success: true,
            message: 'Votre compte est crée avec succès',
            result
        })
    } catch (error) {
        console.log(error);

    }
}

//connexion
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signinSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email }).select('+password')
        if (!existingUser) {
            return res.status(401).json({ success: false, message: "l'utilisateur n'existe pas!" })
        }
        const result = await doHashValidation(password, existingUser.password)
        if (!result) {
            return res.status(401).json({ success: false, message: "Email ou mot de passe invalide!" })
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,

        }, process.env.TOKEN_SECRET,
            {
                expiresIn: '8h'
            }
        )
        res.cookie('Authorization', 'Bearer' + token, {
            expires: new Date(Date.now() + 8 * 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production'
        })
            .json({
                success: true,
                token,
                message: 'connecté avec succès!'
            })
    } catch (error) {
        console.log(error);

    }
}

//deconnexion
exports.signout = async (req, res) => {
    res
        .clearCookie('Authorization')
        .status(200)
        .json({ success: true, message: 'déconnecté avec succès' })
}

//envoyer le code de vérification
exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "l'utilisateur n'existe pas!" })
        }
        if (existingUser.verified) {
            return res
                .status(400)
                .json({ success: false, message: " Vous avez déjà été validé!" })
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString()
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Votre code de validation',
            html: codeValue

        })
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'code envoyé' })
        }
        return res.status(400).json({ success: false, message: 'code non envoyé' })
    } catch (error) {
        console.log(error);

    }
}

//vérifier le code de vérification
exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try {
        const { error, value } = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const codeValue = providedCode.toString()
        const existingUser = await User.findOne({ email }).select("+verificationCode +verificationCodeValidation")

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "l'utilisateur n'existe pas!" })
        }
        if (existingUser.verified) {
            return res.status(400).json({ success: false, message: "Vérification déjà effectuée!" })
        }
        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({ success: false, message: "code invalide!" })
        }
        if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "le code a expiré!" })
        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true
            existingUser.verificationCode = undefined
            existingUser.verificationCodeValidation = undefined
            await existingUser.save()
            return res.status(200).json({ success: true, message: "Vérification réussie !" })
        }

        return res.status(400).json({ success: false, message: "informations invalides!" })
    } catch (error) {
        console.log(error);

    }
}

exports.changePassword = async (req, res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword } = req.body
    try {
        const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
     
        const existingUser = await User.findOne({_id:userId}).select(' +password ')
        if(!existingUser){
            res.status(401).json({ success: false, message: ' l\'utilisateur n\'existe pas!'})
        }
        const result = await doHashValidation(oldPassword,existingUser.password)
        if (!result) {
            
        return res.status(400).json({ success: false, message: "informations invalides!" })
        }
        const hashedPassword = await doHash(newPassword,12)
        existingUser.password = hashedPassword
        await existingUser.save()
        return res.status(200).json({ success: true, message: "Mot de passe changé avec succès" })
    } catch (error) {
        console.log(error);

    }
}

//envoyer le code du mot de pass oublié
exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "l'utilisateur n'existe pas!" })
        }
     
        const codeValue = Math.floor(Math.random() * 1000000).toString()
        const info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: 'Votre code de validation pour le mot de passe oublié',
            html: codeValue

        })
        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({ success: true, message: 'code envoyé' })
        }
        return res.status(400).json({ success: false, message: 'code non envoyé' })
    } catch (error) {
        console.log(error);

    }
}

//vérifier le code de vérification
exports.verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode, newPassword } = req.body;
    try {
        const { error, value } = accepFPCodeSchema.validate({ email, providedCode, newPassword });
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }

        const codeValue = providedCode.toString()
        const existingUser = await User.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation")

        if (!existingUser) {
            return res.status(401).json({ success: false, message: "l'utilisateur n'existe pas!" })
        }

        if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({ success: false, message: "code invalide!" })
        }
        if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: "le code a expiré!" })
        }
        const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)

        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            const hashedPassword = await doHash(newPassword, 12)
            existingUser.password = hashedPassword
            existingUser.forgotPasswordCode = undefined
            existingUser.forgotPasswordCodeValidation = undefined
            await existingUser.save()
            return res.status(200).json({ success: true, message: "Mot de passe changé avec succès !" })
        }

        return res.status(400).json({ success: false, message: "informations invalides!" })
    } catch (error) {
        console.log(error);

    }
}