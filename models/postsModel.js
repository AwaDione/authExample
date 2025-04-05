const { request } = require("express");
const { default: mongoose } = require("mongoose");

const postSchema = mongoose.Schema({
    title:{
        type:String,
        required:[true,'le titre est requis'],
        trim:true,
    },
    description:{
        type:String,
        required:[true,'la descrioption est requis'],
        trim: true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref:'User',
        required:true,
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Post',postSchema)