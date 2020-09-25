const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Feed=mongoose.model("Feed")

router.post('/createfeed',requirelogin,(req,res)=>{

    //res.send("hello")
    const {title,body}=req.body
    if(!title || !body){
        return res.status(422).json({error:"please fill all the required fields"})
    }
    req.user.password=undefined
    req.user.confirmPassword=undefined
    const feed =new Feed({ 
        title:title,
        body:body,
        postedBy:req.user
    })
    feed.save().then(Result=>{
        res.json({feed:Result})
    })
    .catch(error=>{
        console.log(error)
    })
})

router.get("/allfeed",(req,res)=>{
    Feed.find()
    .populate("postedBy" , "_id name email")
    .then(feeds=>{
       res.json({feeds})
    })
    .catch(err=>{
    console.log(err)
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