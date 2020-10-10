const express=require('express');
const app=express()
const mongoose=require('mongoose')
const connectdb =require("./connectdb/db")
const passport=require('passport')
const crypto=require('crypto')
var bodyParser = require('body-parser')
const PORT=5000

//connected to mongoodb
connectdb()

//userSchema model
require('./models/user')
//otpSchema model
require('./models/otp')
//feedSchema model
require('./models/feed')
//profileSchema model
require('./models/profile')
//reset otp
require('./models/resetotp')

app.use(express.static("profileimages"))
app.use(express.static("uploads"))

app.use(express.json())
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

//route file for authentication
app.use(require('./routes/auth'))

//route file for feeds
app.use(require('./routes/feed'))

//route file for user
app.use(require('./routes/user'))

//route file for profile
app.use(require('./routes/profile'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})