const express=require('express');
const app=express()
const mongoose=require('mongoose')
const connectdb =require("./connectdb/db")
const passport=require('passport')
const crypto=require('crypto')
var bodyParser = require('body-parser');
const PORT=5000

//connected to mongoodb
connectdb()

//userSchema model
require('./models/user')
//otpSchema model
require('./models/otp')
//feedSchema model
require('./models/feed')


app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//route file for authentication
app.use(require('./routes/auth'))

//route file for authentication
app.use(require('./routes/feed'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})