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

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *');
//     if (req.method === 'OPTIONS'){
//         res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
//         res.setHeader('Access-Control-Allow-Credentials', true);
//         return res.status(200).json({});
//     }
//     next();
// });
app.use(express.json())
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
//app.use(bodyParser.text(options.text))
//app.use(bodyParser.json({ type: 'application/*+json' }))
 
// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
 
// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

app.use("profileimages",express.static("profileimages"))
//app.use(express.static(path.join(__dirname,'uploads')));
//app.use(express.static("uploads"))

//route file for authentication
app.use(require('./routes/auth'))

//route file for authentication
app.use(require('./routes/feed'))

//route file for authentication
app.use(require('./routes/user'))

//route file for authentication
app.use(require('./routes/profile'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})