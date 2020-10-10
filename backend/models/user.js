const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema.Types
const userschema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    
    email:{
        type:String,
        required:true
    },
    
    password:{
        type:String,
        required:true,
    },
    
    confirmPassword:{
        type:String,
        required:true
    },
    isVerified: { 
        type: String, 
        default: "false"
     },
    username:{
        type:String,
        default:"false"
    },
    userName:{
        type:String,
        default:"instagrammer"
    },
    profilepic:{
        type:String,
        default:"no pic"
    },
    //followers array
    followers: [{type:ObjectId, ref:"User"}],
    //following array
    following: [{type:ObjectId, ref:"User"}],
    //bookmark 
    bookmark:[{type:ObjectId,ref:"Feed"}]
})

mongoose.model("User",userschema)