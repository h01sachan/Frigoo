const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types
const profileSchema=new mongoose.Schema({
    picUrl:
    {
        type:String,
        required:true,
        default:"no profile"
    },
    userName:{
        type:String,
        required:true
    },
    Bio:{
        type:String,
        required:true  
    },
    setBy:{
        type:ObjectId,
        ref:"User"
    }

})
mongoose.model("Profile",profileSchema)