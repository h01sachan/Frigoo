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
    likes:[{type:ObjectId,ref:"User"}],
    postedBy:{
        type:ObjectId,
        ref:"User"
    }
})
mongoose.model("Feed",feedSchema)