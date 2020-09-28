const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema.Types
const userschema=new mongoose.Schema({
    
    name:{
        type:String,
        required:true,
    },
    
    email:{
        type:String,
        required:true,
        match:/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
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
     }
    

})

mongoose.model("User",userschema)