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
		//pushing userId in followersArray, who follows 
		$push:{followers:req.user._id}
	},
    {
    	//updated followers array 
        new:true
	},
	(err,result)=>{
		if(err){
			return res.status(422).json({error:err})
		}
		//now update followingArray of user who follows
        User.findByIdAndUpdate(req.user._id,{
        	//pushing userId in Followingarray who followed by user
            $push:{following:req.body.followId}	
        },
        {
        	//update following array
			new:true
		})
        .select("-password -confirmPassword")
        .then(result=>{
			
        	         res.json(result)
        }).catch(err=>{
        	return res.status(422).json({error:err})
		})
		console.log(result)
	})
})

//API for Unfollow
router.put("/Unfollow",requirelogin ,(req,res)=>{
	//UnfollowId : Id of user to be Unfollowed
	User.findByIdAndUpdate(req.body.UnfollowId,{
		//pulling userId from followersarray who Unfollows 
		$pull:{followers:req.user._id}
	},
    {
    	//updated followersarray
        new:true
	},
	(err,result)=>{
		if(err){
			return res.status(422).json({error:err})
		}
		//now update followingArray of user who Unfollow
        User.findByIdAndUpdate(req.user._id,{
        	//pulling userId from followingArray who Unfollowed by user
            $pull:{following:req.body.UnfollowId}	
        },
        {
        	//update following array
        	new:true})
            .select("-password -confirmPassword")
            .then(result=>{
        	         res.json(result)
        }).catch(err=>{
        	return res.status(422).json({error:err})
        })
	})
})
//search users in database
router.post('/search/users',(req,res)=>{
	//The RegExp object is used for matching text with a pattern.
	//console.log(req.query)
	const name=req.body.name
	console.log(name)
	User.find({name:{$regex:name,$options:"ix"}},{name:1}).sort({"name": -1})
	.then (finded=>{
		res.json({finded})
	})
	.catch(err=>{
		console.log(err)
	})
})

//bookmark API
router.put("/bookmark",requirelogin ,(req,res)=>{

	//find user _id to update his bookmark array
	User.findByIdAndUpdate(req.user._id,{
		//pushing bookmarkfeedId in BookmarkArray 
		$push:{bookmark:req.body.bookmarkfeedId}
	},
    {
    	//updated bookmark array 
        new:true
	},
    (err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }
        //now update followingArray of user who follows
        Feed.findByIdAndUpdate(req.body.bookmarkfeedId,{
            //pushing userId in Followingarray who followed by user
            $push:{bookmark:req.user._id} 
        },
        {
            //update following array
            new:true
        })
        .select("-password -confirmPassword")
        .then(result=>{
            
                     res.json(result)
        }).catch(err=>{
            return res.status(422).json({error:err})
        })
        console.log(result)
    })
})
//unbookmark API
router.put("/unbookmark",requirelogin ,(req,res)=>{

    //find user _id to update his bookmark array
    User.findByIdAndUpdate(req.user._id,{
        //pulling bookmarkfeedId from BookmarkArray
        $pull:{bookmark:req.body.bookmarkfeedId}
    },
    {
        //updated bookmark array 
        new:true
    })
    .then(result=>{
       res.json(result)
     })
    .catch(err=>{
        res.json(err)
    })
})




module.exports = router