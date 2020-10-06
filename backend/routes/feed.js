const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Feed=mongoose.model("Feed")
const Profile=mongoose.model("Profile")
const User=mongoose.model("User")
//var path = require('path');
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
    const photourl = (photo.path).split('\\')[1]
    console.log(title);
    console.log(body);
    console.log(photourl)
    if(!title || !body || !photo){
        return res.status(422).json({error:"please fill all the required fields"})
    }
    Profile.findOne({setBy : req.user.id})
    .select("picUrl userName")
    .then((saved)=>{
        //console.log(saved)
        const profile = saved
    
    req.user.password=undefined
    req.user.confirmPassword=undefined
    const feed =new Feed({ 
        title:title,
        body:body,
        photourl: photourl,
        postedBy:req.user,
        profile : profile
        
    })
  
    feed.save().then(Result=>{
        res.json({feed:Result})
        })
    .catch(error=>{
        console.log(error)
    })  
    })

    .catch(error=>{
        console.log(error)
    })
})



router.delete("/delfeed",requirelogin, (req,res)=>{
    Feed.findById(req.body.feedId)
    .then(delfeed=>{
        if(delfeed.postedBy._id.toString() === req.user._id.toString()){
            delfeed.remove()
        console.log("deleted successfully")
        res.json({delfeed})
         }
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get("/myfeed",requirelogin, (req,res)=>{
    Feed.find({postedBy:req.user._id})
    .select("-profile")
    .then(myfeed=>{
        Profile.findOne({setBy:req.user._id})
        .then((profile)=>{
            User.findOne({_id:req.user._id})
            .select("followers following")
            .then(follower=>{
                res.json({profile,follower,myfeed,});
            })
            .catch(err=>{
                console.log(err)
            })
        })
        .catch(err=>{
            console.log(err)
        })
        
    })
    .catch(err=>{
        console.log(err)
    })
})

router.get("/bookmarkedfeeds",requirelogin, (req,res)=>{
    Feed.find({_id:{$in:req.user.bookmark}})
    .populate("postedBy" , "_id name email")
    .populate("profile","userName picUrl")
    .then(feeds=>{
        feeds.reverse()
        res.json({feeds})
    })
    .catch(err=>{
        console.log(err)
    })
})


router.put('/like/post',requirelogin,(req,res)=>{
     //req user's feedid from client side
    Feed.findByIdAndUpdate(req.body.feedId,{
    //pushing user id in array who liked it
        $push:{likes:req.user._id}, 
    },
    {
        //You should set the new option to true to return the document after update was applied.
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
    Feed.findByIdAndUpdate(req.body.feedId,{
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
router.put('/comment',requirelogin,(req,res)=>{
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
     //The exec() method executes a search for a match in a specified string. Returns a result array, or null 
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})       
        }
        else{
            res.json(result)
        }
    })
})
router.get('/following/user/feed',requirelogin,(req,res)=>{
    req.user.following.push(req.user._id);
    console.log(req.user.following)
    Feed.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id")
    .populate("profile","userName picUrl")
    .populate("comments.postedBy","_id name")
    .then(viewfeeds=>{
        
        req.user.following.pull(req.user._id)
        console.log(req.user.following)
        res.json({viewfeeds})

    })
    .catch(err=>{
        console.log(err)
    })
})



module.exports=router