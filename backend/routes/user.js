const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const Feed=mongoose.model("Feed")
const requirelogin = require('../Controllers/jwt-login')

//profile API
router.get("/user/:id",requirelogin,(req,res)=>{
	User.findOne({_id:req.params.id})
	.select("-password -confirmPassword")
	.then(user=>{
		Feed.find({postedBy:req.params.id})
       .populate("postedBy" , "_id name email")
       .exec((err,feeds)=>{
       	if(err){
       		return res.status(404).json({error:err})
       	}
       	res.json({user,feeds})
       	})
       })
	    .catch(err=>{
	    	return res.status(404).json({error:"user not found"})
	    })

	})

module.exports = router