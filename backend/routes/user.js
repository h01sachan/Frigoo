const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const Feed = mongoose.model("Feed")
const Profile = mongoose.model("Profile")
const requirelogin = require('../Controllers/jwt-login')

//profile API
router.get("/user/:id", requirelogin, (req, res) => {
	User.findOne({ _id: req.params.id })
		.select("followers following")
		.then(follower => {

			Feed.find({ postedBy: req.params.id })
				.select("title body photourl likes comment")
				.then(myfeed => {

					Profile.findOne({ setBy: req.params.id })
						.select("picUrl userName Bio")
						.then(profile => {

							res.json({ profile, follower, myfeed, })

						})
						.catch(err => {
							return res.json(err)
						})

				})
				.catch(err => {
					return res.json(err)
				})

		})
		.catch(err => {
			return res.status(404).json({ error: "user not found" })
		})
})

//API for follow
router.put("/follow", requirelogin, (req, res) => {
	//followId : Id of user to be followed
	User.findByIdAndUpdate(req.body.followId, {

		//The $addToSet operator adds a value to an array unless the value is already present,
		$addToSet: { followers: req.user._id }
	},
		{
			//updated followers array 
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//now update followingArray of user who follows
			User.findByIdAndUpdate(req.user._id, {
				//pushing userId in Followingarray who followed by user
				$addToSet: { following: req.body.followId }
			},
				{
					//update following array
					new: true
				})
				.select("-password -confirmPassword")
				.then(result => {

					res.json(result)
				}).catch(err => {
					return res.status(422).json({ error: err })
				})
			console.log(result)
		})
})

//API for Unfollow
router.put("/Unfollow", requirelogin, (req, res) => {
	//UnfollowId : Id of user to be Unfollowed
	User.findByIdAndUpdate(req.body.unfollowId, {
		//pulling userId from followersarray who Unfollows 
		$pull: { followers: req.user._id }
	},
		{
			//updated followersarray
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//now update followingArray of user who Unfollow
			User.findByIdAndUpdate(req.user._id, {
				//pulling userId from followingArray who Unfollowed by user
				$pull: { following: req.body.unfollowId }
			},
				{
					//update following array
					new: true
				})
				.select("-password -confirmPassword")
				.then(result => {
					res.json(result)
				}).catch(err => {
					return res.status(422).json({ error: err })
				})
		})
})
//search users in database
router.post('/search/users', (req, res) => {
	//The RegExp object is used for matching text with a pattern.
	//console.log(req.query)
	const name = req.body.name
	console.log(name)
	User.find({ name: { $regex: name, $options: "ix" } }, { name: 1, userName: 1, profilepic: 1, username: 1 }).sort({ "name": -1 })
		.then(finded => {
			res.json({ finded })
		})
		.catch(err => {
			console.log(err)
		})
})
// router.post('/graball',(req,res)=>{
// 	const id=req.body._id;
// 	User.findById(id)
// 	.select("-password -confirmPassword")
// 	.then(result=>{

// 		res.json(result)
// 	}).catch(err=>{
// 		return res.status(422).json({error:err})
// 	})
// })

//bookmark API
router.put("/bookmark", requirelogin, (req, res) => {

	//find user _id to update his bookmark array
	User.findByIdAndUpdate(req.user._id, {
		//pushing bookmarkfeedId in BookmarkArray 
		$addToSet: { bookmark: req.body.bookmarkfeedId }
	},
		{
			//updated bookmark array 
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//now update followingArray of user who follows
			Feed.findByIdAndUpdate(req.body.bookmarkfeedId, {
				//pushing userId in Followingarray who followed by user
				$addToSet: { bookmark: req.user._id }
			},
				{
					//update following array
					new: true
				})
				.select("-password -confirmPassword")
				.then(result => {

					res.json(result)
				}).catch(err => {
					return res.status(422).json({ error: err })
				})
			console.log(result)
		})
})
//unbookmark
router.put("/unbookmark", requirelogin, (req, res) => {

	//find user _id to update his bookmark array
	User.findByIdAndUpdate(req.user._id, {
		//pushing bookmarkfeedId in BookmarkArray 
		$pull: { bookmark: req.body.bookmarkfeedId }
	},
		{
			//updated bookmark array 
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//now update followingArray of user who follows
			Feed.findByIdAndUpdate(req.body.bookmarkfeedId, {
				//pushing userId in Followingarray who followed by user
				$pull: { bookmark: req.user._id }
			},
				{
					//update following array
					new: true
				})
				.select("-password -confirmPassword")
				.then(result => {

					res.json(result)
				}).catch(err => {
					return res.status(422).json({ error: err })
				})
			console.log(result)
		})
})
router.post('/clear',requirelogin,( req,res)=>{
	User.findOne({_id:req.user._id})
	.then(saveduser=>{
		saveduser.bookmark
	})
})
// router.get("/followinglist",requirelogin,(req,res)=>{
// 	//The RegExp object is used for matching text with a pattern.
// 	//console.log(req.query)
// 	const id=req.body.id_of_user
// 	User.findOne({_id:id})
// 	.then(finded=>{
// 		if(!finded)
// 		{
// 			return res.json({msg:"user not found"})
// 		}
// 		User.findOne({ _id: { $in: finded.following } })
// 			.select("name username userName profilepic")
// 			.then(followinglist => {
// 				res.json({ followinglist })
// 			})
// 			.catch(err => {
// 				console.log(err)
// 			})
// 	})
// 	.catch(err=>{
// 		console.log(err)
// 	})



// })
// router.get("/followerslist",requirelogin,(req,res)=>{
// 	//The RegExp object is used for matching text with a pattern.
// 	//console.log(req.query)

// 	User.findOne({_id:{$in:req.user.followers}})
// 	.select("name username userName profilepic")
// 	.then(followerlist=>{
// 		res.json({followerlist})
// 	})
// 	.catch(err=>{
// 		console.log(err)
// 	})
// })




// const name=req.body.name
// console.log(name)
// User.find({name:{$regex:name,$options:"ix"}},{name:1,userName:1,profilepic:1,username:1}).sort({"name": -1})
// .then (finded=>{
// 	res.json({finded})
// })
// .catch(err=>{
// 	console.log(err)
// })



router.get("/followers/:id" , (req,res)=>{
    User.findById(req.params.id)
    .then(follower=>{
         User.findById({$in : {follower.followers}})
         .select("name username userName profilepic")
         .then(followers=>{
            res.json({followers})
         })
    })
    .catch(err=>{
        return res.json(err)
    })
})

router.get("/following/:id" , (req,res)=>{
    User.findById(req.params.id)
    .then(following=>{
         User.findById({$in : {following.following}})
         .select("name username userName profilepic")

         .then(followings=>{
            res.json({followings})
         })
    })
    .catch(err=>{
        return res.json(err)
    })
})

module.exports = router

