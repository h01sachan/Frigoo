const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../keys')
const requirelogin = require('../Controllers/jwt-login')
const {body , validationResult} = require("express-validator")
const nodemailer = require("nodemailer")
const nodemailersendgrid = require("nodemailer-sendgrid-transport")
const passport=require('passport')
const crypto=require('crypto')
const { route } = require('./feed')



router.get('/',(req,res)=>{
    res.send("hello")
})
        //at 204 invalid eamil or password
        //at 203 please add email or password
        //at 423 email doesnt exist
        // at 424 now verify your email
        //at 205 user already exists
        //at 422 confirm your password
        //at 401 please add all the fields
        //at 400 error is password must contain 5 characters

const transporter = nodemailer.createTransport(nodemailersendgrid({
    auth:{
        api_key: "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"
       // api_key: "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"
       //api_key: "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"
    }
}))
//signup API
router.post('/signup',[ body("password").isLength({min:5}) ] , 
(req,res)=>{
    console.log(req.body.name)
    const error =validationResult(req);
    if(!error.isEmpty()) {
        
        //at 400 error is password must contain 5 characters
        return res.status(400).json({error: "password must contain atleast 5 characters"});
    }

    const{name,email,password,confirmPassword}=req.body

    //all details should be mentioned
    if(!email || !password || !name || !confirmPassword ) {
        
        //at 401 please add all the fields
        return res.status(401)
        .json({error:"please add all the fields"})
    }
    
    //password should be confirmed
    if(password != confirmPassword) {
        //at 422 confirm your password
        return res.status(422).json({error:"confirm your password"})
    }
    
    //email should be unique
    User.findOne({ email:email }).then((savedUser)=>{
        if (savedUser){
            //at 205 user already exists
            return res.status(205)
            .json({error:"user already exist"})
        }

        //password must be hashed
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name,
                confirmPassword,
                emailToken: crypto.randomBytes(64).toString('hex'),
                isverified:"false"
            })

            //if no error then saved successfully
            user.save().then(user=>{
                //sending email if signup successfully
                    transporter.sendMail({
                    to:user.email,
                    from:"sachan.himanshu2001@gmail.com",
                    subject:"signup successfully",
                    html:`<h1>welcome to Frigoo lets enjoy the ultimate features of Frigoo</h1>
                    <a href ="http://localhost:5000/verify?token=${user.emailToken}">verify </a>`
                })
                //res.redirect('/verify')
                // at 424 now verify your email
                return res.status(424).json({message:"saved successfully now verify your email"})
            })
            .catch(err=>{
                //at 423 email doesnt exist
                return res.status(423).json({error:"email does not exist"})
            })
        })

    })
    .catch(err=>{
        res.json(err)
    })
})

router.post('/verify',(req,res)=>{
    const email=req.body.email
    
    User.findOne({ email:email }).then(user => {
        user.isVerified="true"
        user.emailToken=null
        user.save()
        console.log(user)
        //res.send("verified")
        res.redirect('/login')
        
      })
      .catch(err=>{
        console.log(err)
    })
      
      
})
   /*User.findOne({ emailToken:req.query.token}).then((savedUser)=>{
    if (savedUser){

        const user=new User({
            email,
                password,
                name,
                confirmPassword,
            emailToken: null,
            isverified:true
        })
        user.save()
        return res.redirect('/login')
        //return res.status(202)
       //.json({error:"user already exist"})
    }
    return res.json({error:"token is invalid"})*/
   /* try{
        const user =await User.findOne({emailToken:req.query.token})
        if((!user)){
            return res.json({error:"token is invalid"})
        }
        user.emailToken=null
        user.isverified=true
        await user.save()
        return res.redirect('/')
    }
    catch(err){
        console.log(err)
        res.redirect('/')
    }
    */
        /*if(!match)
        {
            res.json(({message:"token not verified"}))
            return res.redirect('/signup')
        }
        const user=new User({
            emailToken: null,
            isverified:true
        })
        user.save()
        res.json(({message:"verified"}))
        return res.redirect('/')
    })*/
    




//login API
router.post('/login',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password)
    {
        
        //at 203 please add email or password
        return res.status(202).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            //at 204 invalid eamil or password
            return res.status(204).json({error:"invalid eamil or password"})
        }
        //console.log(savedUser.isVerified)
        console.log(savedUser.isVerified)
        if(savedUser.isVerified==="false")
        {
            //return res.send("plase verify")
            transporter.sendMail({
                to:savedUser.email,
                from:"sachan.himanshu2001@gmail.com",
                subject:"signup successfully",
                html:`<h1>welcome to Frigoo lets enjoy the ultimate features of Frigoo</h1>
                <a href ="http://localhost:5000/verify?token=${savedUser.emailToken}">verify </a>`})
            return res.send("please verify your email")
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
                return res.status(204).json({message:"invalid eamil or password"})
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