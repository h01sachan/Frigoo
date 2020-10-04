const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types
const feedSchema=new mongoose.Schema({
    title:
    {
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    photourl:{
        type:String,
        required:true  
    },
    //making a likes array which will have user id of users who liked
    likes:[{type:ObjectId,ref:"User"}],
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    //making an comment array which have text and user id
    comment:[{
        text:String,
        postedBy:{type:ObjectId,ref:"User"}
    }],
    profile :{
        type:ObjectId,
        ref:"Profile"
    },
    //bookmark 
    bookmark:[{type:ObjectId,ref:"User"}],

})
mongoose.model("Feed",feedSchema)