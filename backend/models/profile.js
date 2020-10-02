const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types
const profileSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    Bio:{
        type:String
  
    },
    picUrl:
    {
        type:String,
        default:"no profile"
    },
    setBy:{
        type:ObjectId,
        ref:"User"
    }

})
mongoose.model("Profile",profileSchema)