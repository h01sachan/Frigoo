const mongoose=require('mongoose')
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
    }

})

mongoose.model("User",userschema)