const express=require('express')
const router=express.Router()
const mongoose = require('mongoose')
const User=mongoose.model("User")
const OtpUser=mongoose.model("OtpUser")
const resetOtp=mongoose.model("resetOtp")
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
const otpGenerator = require("otp-generator")
const config=require("../config")
// const { match } = require('assert')
var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;



router.get('/',(req,res)=>{
    res.send("hello")
})

const transporter = nodemailer.createTransport(nodemailersendgrid({
    auth:{
        api_key: config.api_key
    }
}))
//signup API
router.post('/signup',[ body("password").isLength({min:5}) ] , 
(req,res)=>{
    const error =validationResult(req)
    if(!error.isEmpty()) {
        
        //at 403 error is password must contain 5 characters
        return res.status(403).json({error: "password must contain atleast 5 characters"});
    }

    const{name,email,password,confirmPassword}=req.body
    var valid = emailRegex.test(email)
    if(!valid)
    {
        return res.status(403).json({error: "please enter valid email"});
    }

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
        .catch(err=>{
            res.json(err)
        })

    })
    .catch(err=>{
        console.log(err)
        res.json({error:"email does not exist"})
    })
})

router.post('/changepassword',[ body("newpassword").isLength({min:5}) ],(req,res)=>{
    const{resettoken,resetotp,email,newpassword,confirmpassword}=req.body
    var newpwd
    const error =validationResult(req)
    if(!error.isEmpty()) {
        
        //at 403 error is password must contain 5 characters
        return res.status(403).json({error: "password must contain atleast 5 characters"});
    }
    console.log(resettoken)
    resetOtp.findOne({resettoken:resettoken})
    .then((resetuser)=>{
        if (resetuser==null) {
            return res.status(403).json({error:"otp expired"})
            // console.log(error)
        }
        if(newpassword!=confirmpassword)
        {
            return res.status(405).json({error:"password do not matched"})
        }
        bcrypt.hash(newpassword,12)
        .then(hashedpassword=>{
            newpwd=hashedpassword;
            const user=new resetOtp({
                newpassword:hashedpassword,
                confirmpassword:hashedpassword,
            })
            user.save()
            console.log(user)
        })
        
        if (resetuser.resetotp === resetotp)
        {
            User.findOne({ email: resetuser.email }).then(user => {
                console.log(newpassword)
                user.password=newpwd
                user.confirmPassword=newpwd
                //console.log(user)
                user.save()
                //console.log(user)
            })
            
            resetuser.remove()
            return res.status(200).json({
                message: "password successfully updated",
            })   
        }
        else{
            return res.status(406).json({error:"otp entered is invalid "})
        }

    })
    .catch(err=>{
        console.log(err)
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
          otpuser.remove()
          const token=jwt.sign({_id:user._id},JWT_SECRET,{expiresIn:'6h'})
          const {_id,name,followers,following,username}=user

            return res.status(201).json({message:"otp entered is correct, user added",token:token,user:{_id,name,email,followers,following,username}})
        })

        //after verification remove user's otp database

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
router.post('/forgotpassword',(req,res)=>{
    const{email}=req.body
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser==null)
        {
            return res.status(203).json({error:"invalid eamil"})
        }
    //agar phele se present hua token toh usse expire kar diya
    resetOtp.findOne({email:email})
    .then((ifpresent)=>{
        ifpresent.resettoken=null
        ifpresent.save()
    })

    //else generating reset otp
    let resetotp = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        upperCase: false,
    })
    const resettoken = jwt.sign(
    {
        email: email
    },
    "resetotptoken",
        { expiresIn: 36000 } //in three minute
    )
    const otpdata = new resetOtp({
        resettoken: resettoken,
        resetotp: resetotp,
        email: email
    })
    console.log(resetotp)
    otpdata.save()
    res.status(201).json({ message: "otp is generated" , token:resettoken})

    return transporter.sendMail({
        
        from: "sachan.himanshu2001@gmail.com",
        to: email,
        subject: "otp verification",
        html: `<h1>welcome to frigoo to enjoy our feature please verify your email using this otp : ${resetotp}</h1>`

    })
    .catch(err=>{
        console.log(err)
    })
    
})
})
router.post('/resend',(req,res)=>{
    const{email}=req.body
    //expiring last token so that only latest otp is valid
    OtpUser.findOne({email:email})
    .then((otpuser)=>{
        otpuser.token=null
        otpuser.save()

    })
    let otp = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        upperCase: false,
      })
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
router.post('/resendresetotp',(req,res)=>{
    const{email}=req.body
    //expiring last token so that only latest otp is valid
    resetOtp.findOne({email:email})
    .then((otpuser)=>{
        otpuser.token=null
        otpuser.save()

    })
    let resetotp = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        upperCase: false,
    })
    const resettoken = jwt.sign(
    {
        email: email
    },
    "resetotptoken",
        { expiresIn: 36000 } //in three minute
    )
    const otpdata = new resetOtp({
        resettoken: resettoken,
        resetotp: resetotp,
        email: email
    })
    console.log(resetotp)
    otpdata.save()
    res.status(201).json({ message: "otp is generated" , token:resettoken})
    return transporter.sendMail({
        from: "sachan.himanshu2001@gmail.com",
        to: email,
        subject: "otp verification",
        html: `<h1>welcome to frigoo to enjoy our feature please verify your email using this otp : ${resetotp}</h1>`

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
        return res.status(203).json({error:"please add email or password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        console.log(savedUser)
        if(savedUser==null){
            //at 204 invalid eamil or password
            return res.status(203).json({error:"invalid eamil or password"})
        }
        // //console.log(savedUser.password)
        // if(savedUser.password!=password)
        // {
        //     return res.status(202).json({error:"invalid eamil or password"})

        // }
    
        
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
            console.log(token)
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
                User.findOne({email:email})
                .then((alreadylogged)=>{
                alreadylogged.token=null;
                alreadylogged.save()

                })
                //return res.json({message:"successfully logged in"})
                const token=jwt.sign({_id:savedUser._id},JWT_SECRET,{expiresIn:'6h'})
                const {_id,name,followers,following,username}=savedUser


                //console.log(token)
                //return res.json({token:token})
                return res.status(200).json({msg:"logged in successfully",token:token,user:{_id,name,email,followers,following,username}})
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