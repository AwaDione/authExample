const { createPostSchema } = require("../middlewares/validator");
const Post = require("../models/postsModel");


exports.getPosts = async (req, res) => {
    const {page} = req.query
    const postPerPage=10
    try {
        let pageNum = 0
        if (page <= 1) {
            pageNum = 0
        }else {
            pageNum = page - 1
        }
        const result = await Post.find().sort({createdAt: -1}).skip(pageNum * postPerPage).limit(postPerPage).populate({
             path: 'userId',
            select:'email'
        })
        return res.status(200).json({success: true, message:'Posts', data:result})
    } catch (error) {
        console.log(error);
        
    }
}

exports.singlePost = async (req, res) => {
    const {_id} = req.query
    try {
       
        const result = await Post.findOne({_id}).populate({
             path: 'userId',
            select:'email'
        })
        return res.status(200).json({success: true, message:'Post', data:result})
    } catch (error) {
        console.log(error);
        
    }
}

exports.createPost = async (req, res) =>{
    const { title, description } = req.body
    const { userId } = req.user
    try {
        const {error, value} = createPostSchema.validate({
            title,
            description,
            userId
        })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const result = await Post.create({
            title,
            description,
            userId
        })
        return res.status(201).json({success: true, message:'Post crée avec succès!', data:result})
    } catch (error) {
        console.log(error);
        
    } 
}


exports.updatePost = async (req, res) =>{
    const {_id} = req.query
    const { title, description } = req.body
    const { userId } = req.user
    try {
        const {error, value} = createPostSchema.validate({
            title,
            description,
            userId
        })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingPost = await Post.findOne({_id})
        if (!existingPost) {
        return res.status(404).json({success: false, message:'le post n\'existe pas!'})
            
        }
        if (existingPost.userId.toString() !== userId) {
        return res.status(403).json({success: false, message:'Non autorisé'})
            }
            existingPost.title = title
            existingPost.description = description
            const result = await existingPost.save()
        return res.status(200).json({success: true, message:'Post mis à jour!', result})

    } catch (error) {
        console.log(error);
        
    } 
}