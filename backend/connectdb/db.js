const express = require("express")
const mongoose = require("mongoose")
//const dburl = "mongodb+srv://nk:gjY3HabQONnmYAkO@cluster0.yi38u.mongodb.net/test?retryWrites=true&w=majority"

const {MONGOURI}=require('../keys')
const dburl =MONGOURI
//function t0 connect with database
const connectdb = ()=>
{
mongoose.connect(dburl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
    
})
mongoose.connection.on('connected',()=>{
    console.log("connected to mongo"); 
})

mongoose.connection.on('error',(err)=>{
    console.log("error occur", err); 
})
}

module.exports =connectdb
