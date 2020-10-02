const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Profile=mongoose.model("Profile")
const User=mongoose.model("User")
const multer = require("multer")



const storage = multer.diskStorage({
    destination: (req,file, cb)=>{  //choose the destination for storing images
        cb(null,"./profileimages/");
    },
    filename: (req,file,cb)=>{      //set filename as originalfilename 
        cb(null, file.originalname)
    }
})

//function to filter the image type
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg"){
        cb(null,true);
    } else{
        cb(null,false)
    }
}

const imp = multer({storage:storage ,fileFilter:fileFilter}).single("picUrl")
//Create uploadProfile API
//using requirelogin to make this route protected
router.post('/uploadProfile',[requirelogin,imp],(req,res)=>{

    const {userName,Bio}=req.body
    console.log(userName)
    console.log(Bio)
    //const photo=req.file
    //console.log(photo)
    
    const picUrl = req.file.path
    console.log(picUrl)


    if(!userName){
        return res.status(422).json({error:"please fill all the required fields"})
    }
    //console.log(photo)
    
    Profile.findOneAndDelete({setBy:req.user._id}).then((saved)=>{
        console.log("existing profile has deleted")
    })
    console.log("done")

    Profile.findOne({ userName:userName }).then((savedUser)=>{
        if (savedUser){
            //at 205 user already exists
            //console.log(savedUser)
            //console.log(savedUser.setBy)
            //console.log(req.user._id)
            return res.status(401)
            .json({error:"user already exist"})
             
        }

    req.user.password=undefined
    req.user.confirmPassword=undefined
    const profile =new Profile({ 
        userName:userName,
        Bio:Bio,
        picUrl: picUrl,
        setBy:req.user
        
    })
    //console.log(profile)
    profile.save().then(Result=>{
        res.json({profile:Result})
    })
    .catch(error=>{
        console.log(error)
    })
})
.catch(error=>{
    console.log(error)
})
})



module.exports=router
