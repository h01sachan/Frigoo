const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const OtpUser=mongoose.model("OtpUser")
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
const otpGenerator = require("otp-generator");



router.get('/',(req,res)=>{
    res.send("hello")
})

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
    const error =validationResult(req);
    if(!error.isEmpty()) {
        
        //at 403 error is password must contain 5 characters
        return res.status(403).json({error: "password must contain atleast 5 characters"});
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
        //at 403 confirm your password
        return res.status(403).json({error:"confirm your password"})
    }
    
    //email should be unique
    User.findOne({ email:email }).then((savedUser)=>{
        if (savedUser){
            //at 205 user already exists
            return res.status(401)
            .json({error:"user already exist"})
        }

        //password must be hashed
        bcrypt.hash(password,12)
        .then(hashedpassword=>{
            const user=new User({
                email,
                password:hashedpassword,
                name,
                confirmPassword:hashedpassword,
                //emailToken: crypto.randomBytes(64).toString('hex'),
                isVerified:"false" //this will tell if user verfied or not
            })
            user.save()
            //generated otp using otp generatror
            let otp = otpGenerator.generate(6, {
                alphabets: false,
                specialChars: false,
                upperCase: false,
              })
            const token = jwt.sign(
            {
                email: email,
            },
            "otptoken",{ expiresIn: 180 } //in three minute
            )
            const otpdata = new OtpUser({
                token: token,
                email:email,
                otp: otp
            })
            console.log(otp)
            otpdata.save()
            res.status(201).json({ message: "otp is generated" , token:token});
            //if no error then saved successfully

            return transporter.sendMail({
                
                from: "sachan.himanshu2001@gmail.com",
                to: email,
                subject: "signup successful",
                html: `<h1>welcome to frigoo to enjoy our feature please verify your email using this otp : ${otp}</h1>`

              });
        })

    })
    .catch(err=>{
        res.json(err)
    })
})



router.post('/otpverify',(req,res)=>{

    const{token,otp,email}=req.body

  // searching for otp in database by token that i stored by token1
  console.log(token)
  OtpUser.findOne({token:token})
    .then((otpuser) => {
      //console.log("found token");
      // if not found
      //console.log(otpuser.otp)
      if (otpuser==null) {
        return res.status(403).json({error:"otp expired"})
        // console.log(error)
      }
      
      // check if entered otp is valid
      if (otpuser.otp === otp) {

        User.findOne({ email: otpuser.email }).then(user => {
          user.isVerified="true"
          console.log(user)
          user.save()
        })

        //after verification remove user's otp database
        otpuser.remove()

        return res.status(200).json({
            message: "otp entered is correct, user added",
            })
        } 
        else 
        {
            return res.status(403).json({error:"otp entered is invalid "})
        }
        //console.log(error)
      })
    .catch(err=>{
        console.log(err)
    })
})

router.post('/resend',(req,res)=>{
    const{email}=req.body
    let otp = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        upperCase: false,
      });
    const token = jwt.sign(
    {
        email: email,
    },
    "otptoken",
        { expiresIn: 180 } //in three minute
    )
    const otpdata = new OtpUser({
        token: token,
        otp: otp,
        email: email
    })
    console.log(otp)
    otpdata.save()
    res.status(201).json({ message: "otp is generated" , token:token})

    return transporter.sendMail({
        
        from: "sachan.himanshu2001@gmail.com",
        to: email,
        subject: "otp verification",
        html: `<h1>welcome to frigoo to enjoy our feature please verify your email using this otp : ${otp}</h1>`

      });

})
//login API
router.post('/login',(req,res)=>{
    const {email,password}=req.body
    // console.log(req.body.name)
    // console.log(req.body.email)
    // console.log(req.body.confirmPassword)
    // console.log(req.body.password)
    if(!email || !password)
    {   
        //at 203 please add email or password
        return res.status(202).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        console.log(savedUser)
        if(savedUser==null){
            //at 204 invalid eamil or password
            return res.status(202).json({error:"invalid eamil or password"})
        }
    
        
        if(savedUser.isVerified==="false")
        {
            let otp = otpGenerator.generate(6, {
                alphabets: false,
                specialChars: false,
                upperCase: false,
              });
            const token = jwt.sign(
            {
                email: email,
            },
            "otptoken",
                { expiresIn: 180 } //in three minute
            )
            const otpdata = new OtpUser({
                token: token,
                otp: otp,
                email: email
            })
            console.log(otp)
            otpdata.save()
            res.status(201).json({ message: "otp is generated" , token:token})

            return transporter.sendMail({
                
                from: "sachan.himanshu2001@gmail.com",
                to: email,
                subject: "otp verification",
                html: `<h1>welcome to frigoo to enjoy our feature please verify your email using this otp : ${otp}</h1>`

              });

        }


        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            console.log(doMatch)
            if(doMatch)
            {
                //return res.json({message:"successfully logged in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET)


                //console.log(token)
                return res.json({token:token})
            }
            else{
                return res.status(202).json({error:"wrong password"})
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