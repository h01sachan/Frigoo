const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const requirelogin = require('../Controllers/jwt-login')
const Profile = mongoose.model("Profile")
const User = mongoose.model("User")
const Feed = mongoose.model("Feed")
require('./feed')
const multer = require("multer")
var userregex="^(?=.{6,20}$)(?![_.])(?.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$"


const storage = multer.diskStorage({
    destination: (req, file, cb) => {  //choose the destination for storing images
        cb(null, "./profileimages/");
    },
    filename: (req, file, cb) => {      //set filename as originalfilename 
        cb(null, file.originalname)
    }
})

//function to filter the image type
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false)
    }
}

const imp = multer({ storage: storage, fileFilter: fileFilter }).single("photo")
//Create uploadProfile API
//using requirelogin to make this route protected
router.post('/uploadProfile', [requirelogin, imp], (req, res) => {

    const { userName, Bio } = req.body
    console.log(userName)
    console.log(Bio)
    const photo = req.file
    console.log(photo)

    const picUrl = (photo.path).split('\\')[1]
    console.log(picUrl)

    //new hoga toh create
    //already user hai aur same user hai to update karna hai
    //if username already exist toh not update 
    
    if (!userName || !photo) {
        return res.status(422).json({ error: "please fill all the required fields" })
    }

    //if username already exist
    Profile.findOne({ userName: userName }).then((saved) => {

        if (saved) {
            if (saved.setBy.toString() !== req.user._id.toString()) {
                return res.status(422).json({ error: "user already exist" })
            }
            saved.userName = userName;
            saved.Bio = Bio;
            saved.picUrl = picUrl;
            saved.save();
            User.findById(req.user._id)
                .then(newname => {
                    newname.userName = userName
                    newname.profilepic=picUrl
                    newname.userName=true
                    newname.save();
                })
                .catch(err => {
                    console.log(err)
                })
            return res.json({ message: "successfully updtaed" })

        }
        Profile.findOne({ setBy: req.user._id }).then((ifpresent) => {
            if (ifpresent) {
                ifpresent.userName = userName;
                ifpresent.Bio = Bio;
                ifpresent.picUrl = picUrl;
                ifpresent.save();
                    User.findById(req.user._id)
                    .then(newname => {
                        newname.userName = userName
                        newname.profilepic=picUrl
                        newname.username=true
                        newname.save();
                    })
                    .catch(err => {
                        console.log(err)
                    })
                return res.json({ message: "successfully updtaed" })
            }
            const profile = new Profile({
                userName: userName,
                Bio: Bio,
                picUrl: picUrl,
                setBy: req.user._id
            })
            profile.save()
            User.findOne({ email: req.user.email })
                .then((name) => {
                    name.username = true;
                    name.userName=userName;
                    name.profilepic=picUrl
                    name.save();
                })
                .catch(err => {
                    console.log(err)
                })
            return res.json({ message: "successfully created profile" })
        })
            .catch(error => {
                console.log(error)
            })


    })
        .catch(error => {
            console.log(error)
        })


})


router.get("/myprofile", requirelogin, (req, res) => {
    Profile.find({ setBy: req.user._id })
        .populate("setBy", "_id name email")
        .then(myprofile => {
            res.json({ myprofile })
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router
