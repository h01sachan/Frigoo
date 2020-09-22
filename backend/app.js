const express=require('express');
const app=express()
const mongoose=require('mongoose')
const connectdb =require("./connectdb/db")

const PORT=5000

//connected to mongoodb
connectdb()

//userSchema model
require('./models/user')


app.use(express.json())

//route file for authentication
app.use(require('./routes/auth'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})