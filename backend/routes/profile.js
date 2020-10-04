const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Profile=mongoose.model("Profile")
const User=mongoose.model("User")
const Feed=mongoose.model("Feed")
require('./feed')
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

const imp = multer({storage:storage ,fileFilter:fileFilter}).single("photo")
//Create uploadProfile API
//using requirelogin to make this route protected
router.post('/uploadProfile',[requirelogin,imp],(req,res)=>{
 
    const {userName,Bio}=req.body
    console.log(userName)
    console.log(Bio)
    const photo=req.file
    console.log(photo)
    
    const picUrl = (photo.path).split('\\')[1]
    console.log(picUrl)
 
    //new hoga toh create
    //already user hai aur same user hai to update karna hai
    //if username already exist toh not update 
 
    if(!userName || !photo){
        return res.status(422).json({error:"please fill all the required fields"})
    }
 
    //if username already exist
    Profile.findOne({userName:userName}).then((saved)=>{
        if(saved)
        {
            console.log(saved.setBy)
            console.log(req.user._id)
            if((saved.setBy)!=(req.body._id))
            {
                return res.status(401).json({error:"user already exist"})
            }
        }
    Profile.findOneAndDelete({setBy:req.user._id}).then((saved)=>{
        console.log("existing profile has deleted")
        req.user.password=undefined
        req.user.confirmpassword=undefined
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
                User.findOne({email:req.user.email})
                .then((name)=>{
                    name.username=true;
                    name.save();
                })
                .catch(err=>{
                    console.log(err)
                })
        console.log("successfully updated")
    })
    
})
.catch(error=>{
    console.log(error)
})
})


router.get("/myprofile",requirelogin, (req,res)=>{
    Profile.find({setBy:req.user._id})
    .populate("setBy" , "_id name email")
    .then(myprofile=>{
        res.json({myprofile})
    })
    .catch(err=>{
        console.log(err)
    })
})

module.exports=router
