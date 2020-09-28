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

//API for follow
router.put("/follow",requirelogin ,(req,res)=>{
	//followId : Id of user to be followed
	User.findByIdAndUpdate(req.body.followId,{
		//pushing userId in array who follows 
		$push:{followers:req.user._id}
	},
    {
    	//updated followers after followed 
        new:true
	},
	(err,result)=>{
		if(err){
			return res.status(422).json({error:err})
		}
		//now update following of user who follow
        User.findByIdAndUpdate(req.user._Id,{
        	//pushing userId in array who followed by user
            $push:{following:req.body.followId}	
        },
        {
        	//update following array
        	new:true}).then(result=>{
        	         res.json(result)
        }).catch(err=>{
        	return res.status(422).json({error:err})
        })
	})
})

module.exports = router