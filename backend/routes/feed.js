const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Feed=mongoose.model("Feed")

const multer = require("multer")
const storage = multer.diskStorage({
    destination: (req,file, cb)=>{
        cb(null,"./uploads/");
    },
    filename: (req,file,cb)=>{
        cb(null, file.originalname)
    }
})
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
        cb(null,true);
    } else{
        cb(null,false)
    }
}
router.use(multer({storage:storage ,fileFilter:fileFilter}).single("photo"))
router.post('/createfeed',requirelogin,(req,res)=>{

    //res.send("hello")
    const {title,body}=req.body
    const photo=req.file
    const photourl = photo.path
    if(!title || !body || !photo){
        return res.status(422).json({error:"please fill all the required fields"})
    }
    //console.log(photo)
    req.user.password=undefined
    req.user.confirmPassword=undefined
    const feed =new Feed({ 
        title:title,
        body:body,
        photourl: photourl,
        postedBy:req.user
        
    })
    feed.save().then(Result=>{
        res.json({feed:Result})
    })
    .catch(error=>{
        console.log(error)
    })
})


router.get("/myfeed",requirelogin, (req,res)=>{
    Feed.find({postedBy:req.user._id})
    .populate("postedBy" , "_id name email")
    .then(myfeed=>{
        res.json({myfeed})
    })
    .catch(err=>{
        console.log(err)
    })
})
module.exports=router