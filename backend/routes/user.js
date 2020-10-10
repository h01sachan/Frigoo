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
	//pushing user._id in FollowersArray of followId user
	User.findByIdAndUpdate(req.body.followId, {

		//The $addToSet operator adds a value to an array unless the value is already present,
		$addToSet: { followers: req.user._id }
	},
		{
			//return updated followers array followId user
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//pushing followId in FolloweingsArray of user._id
			User.findByIdAndUpdate(req.user._id, {
				
				$addToSet: { following: req.body.followId }
			},
				{
					//return updated following array of user
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
	//pulling user._id from followersarray of unfollowId user
	User.findByIdAndUpdate(req.body.unfollowId, {
		 
		$pull: { followers: req.user._id }
	},
		{
			//return updated followersarray unfollowId user
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			}
			//pulling unfollowId user from followingArray of user
			User.findByIdAndUpdate(req.user._id, {
				
				$pull: { following: req.body.unfollowId }
			},
				{
					//return updated following array
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

//bookmark API
router.put("/bookmark", requirelogin, (req, res) => {
    //pushing bookmarkfeedId in BookmarkArray of user
	User.findByIdAndUpdate(req.user._id, {
		$addToSet: { bookmark: req.body.bookmarkfeedId }
	    },
		{
			//return updated bookmark array
			new: true
		},
		(err, result) => {
			if (err) {
				return res.status(422).json({ error: err })
			} 
			//pushing user _id in BookmarkArray of feed
			Feed.findByIdAndUpdate(req.body.bookmarkfeedId, {
				
                $addToSet: { bookmark: req.user._id }
			    },
                //return updated bookmark array
				{
					new: true          
			})
			.select("-password -confirmPassword")
			.then(result => {
                     
                      res.json(result)
			})
            .catch(err => {
				return res.status(422).json({ error: err })
			})
        }
    )
})

//unbookmark API
router.put("/unbookmark", requirelogin, (req, res) => {

    //pulling bookmarkfeedId from BookmarkArray of user
    User.findByIdAndUpdate(req.user._id, {
        $pull: { bookmark: req.body.bookmarkfeedId }
        },
        {
            //return updated bookmark array of user
            new: true
        },
        (err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } 
            //pulling user _id from BookmarkArray of feed
            Feed.findByIdAndUpdate(req.body.bookmarkfeedId, {
                
                $pull: { bookmark: req.user._id }
                },
                //return updated bookmark array of feed
                {
                    new: true          
            })
            .select("-password -confirmPassword")
            .then(result => {
                     
                      res.json(result)
            })
            .catch(err => {
                return res.status(422).json({ error: err })
            })
               console.log(result)
        }
    )
})


//route to get follower list
router.get("/followers/:id" ,requirelogin, (req,res)=>{
    User.findById(req.params.id)
    .then(follower=>{
         User.find({_id:{$in : follower.followers}})
         .select("name username userName profilepic")
         .then(followers=>{
            res.json({followers})
         })
    })
    .catch(err=>{
        return res.json(err)
    })
})

//route to get following list
router.get("/following/:id" ,requirelogin ,(req,res)=>{
    User.findById(req.params.id)
    .then(following=>{
         User.find({_id: {$in : following.following}})
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

