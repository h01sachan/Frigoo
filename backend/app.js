const express=require('express');
const app=express()
const mongoose=require('mongoose')
const connectdb =require("./connectdb/db")
const passport=require('passport')
const crypto=require('crypto')

const PORT=6000

//connected to mongoodb
connectdb()

//userSchema model
require('./models/user')
//feedSchema model
require('./models/feed')


app.use(express.json())


//route file for authentication
app.use(require('./routes/auth'))

//route file for authentication
app.use(require('./routes/feed'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})