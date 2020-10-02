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

const imp = multer({storage:storage ,fileFilter:fileFilter}).single("photo")

//Create post API
//using requirelogin to make this route protected
router.post('/createfeed',[requirelogin,imp],(req,res)=>{

    //res.send("hello")
    const {title,body}=req.body
    const photo=req.file
    const photourl = photo.path
    if(!title || !body || !photo){
        return res.status(422).json({error:"please fill all the required fields"})
    }
    req.user.password=undefined
    req.user.confirmpassword=undefined
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

router.get("/allfeed",requirelogin, (req,res)=>{
    Feed.find()
    .populate("postedBy" , "_id name email")
    .then(feeds=>{
        res.json({feeds})
    })
    .catch(err=>{
        console.log(err)
    })
})


router.put('/like/post',requirelogin,(req,res)=>{
     //req user's feedid from client side
    Feed.findOneAndUpdate(req.body.feedId,{
    //pushing user id in array who liked it
        $push:{likes:req.user._id}, 
    },
    {
        //to get updated user profile after like 
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
router.put('/unlike/post',requirelogin,(req,res)=>{
    //req user's feedid from client side
    Feed.findOneAndUpdate(req.body.feedId,{
        //pulling user id out off array who unliked it
        $pull:{likes:req.user._id}
    },
    {
        //to get updated user profile after unlike 
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
router.put('/comment/on/post',requirelogin,(req,res)=>{
    const comment={
        text:req.body.text, //from client side 
        postedBy:req.user._id //which user has posted a comment
    }
    console.log(comment)
    Feed.findOneAndUpdate(req.user.feedId,{
        //pushing a comment in array with user id
        $push:{comment:comment}
    },
    {
        //to get new and updated instance 
        new:true 
    })
    //populate() function in mongoose is used for populating the data inside the reference.
    //In our case feedSchema is having postedBy field which will reference to the _id field which is basically the ObjectId of the mongodb document.
    .populate("comment.postedby","_id username")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})       
        }
        else{
            res.json(result)
        }
    })
})
router.get('/following-user-post',requirelogin,(req,res)=>{
    Feed.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .then(viewfeeds=>{
        res.json({viewfeeds})

    })
    .catch(err=>{
        console.log(err)
    })
})



module.exports=router