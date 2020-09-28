const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Feed=mongoose.model("Feed")

const multer = require("multer")

//function to store the images
const storage = multer.diskStorage({
    destination: (req,file, cb)=>{  //choose the destination for storing images
        cb(null,"./uploads/");
    },
    filename: (req,file,cb)=>{      //set filename as originalfilename 
        cb(null, file.originalname)
    }
})

//function to filter the image type
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
        cb(null,true);
    } else{
        cb(null,false)
    }
}

router.use(multer({storage:storage ,fileFilter:fileFilter}).single("photo"))

//Create post API
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

router.put('/like-post',requirelogin,(req,res)=>{
    Feed.findOneAndUpdate(req.body.feedId,{
        $push:{likes:req.user._id},
    },
    {
        new:true 
    })
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})       
        }
        else{
            res.json(result)
        }
    })
})
router.put('/unlike-post',requirelogin,(req,res)=>{
    Feed.findOneAndUpdate(req.body.feedId,{
        $pull:{likes:req.user._id},
    },
    {
        new:true 
    })
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})       
        }
        else{
            res.json(result)
        }
    })
})



module.exports=router