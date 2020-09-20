const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../keys')
const requirelogin = require('../controllers/requirelogin')
const {body , validationResult} = require("express-validator")
/*router.get('/',(req,res)=>{
    res.send("hello")
})*/

router.get('/protected',requirelogin,(req,res)=>{
    res.send("hello user")
})

//signup API
router.post('/signup',[ body("password").isLength({min:5}) ] , 
(req,res)=>{
        
    const error =validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({error: "password must contain atleast 5 characters"});
    }

    const{name,email,password,confirmPassword}=req.body

    //all details should be mentioned
    if(!email || !password || !name || !confirmPassword ) {
        return res.status(202)
        .json({error:"please add all the fields"})
    }
    
    //password should be confirmed
    if(password != confirmPassword) {
        return res.status(422).json({error:"confirm your password"})
    }
    
    //email should be unique
    User.findOne({email:email}).then((savedUser)=>{
        if (savedUser){
            return res.status(202)
            .json({error:"user already exist"})
        }

        //password must be hashed
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name,
                confirmPassword
            })

            //if no error then saved successfully
            user.save().then(user=>{
                res.json({message:"saved successfully"})
            })
            .catch(err=>{
                res.json({error:"email does not exist"})
            })
        })

    })
    .catch(err=>{
        res.json(err)
    })
})

//login API
router.post('/login',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password)
    {
        return res.status(202).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(202).json({error:"invalid eamil or password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch)
            {
                //return res.json({message:"successfully logged in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
                //console.log(token)
                return res.json({token:token})
            }
            else{
                return res.status(202).json({message:"invalid eamil or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
    
})
module.exports=router