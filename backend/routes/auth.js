const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../keys')
const requirelogin = require('../middleware/requirelogin')
/*router.get('/',(req,res)=>{
    res.send("hello")
})*/

router.get('/protected',requirelogin,(req,res)=>{
    res.send("hello user")
})

router.post('/signup',(req,res)=>{
    //console.log(req.body.name)
    const{name,email,password}=req.body
    if(!email || !password || !name)
    {
        return res.status(202)
        .json({error:"please add all the fields"})
    }
    User.findOne({email:email}).then((savedUser)=>{
        if (savedUser){
            return res.status(202)
            .json({error:"user already exist"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name
            })
            user.save().then(user=>{
                res.json({message:"saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
         
    })
    .catch(err=>{
        console.log(err)
    })
})

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