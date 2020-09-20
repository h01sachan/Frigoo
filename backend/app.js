const express=require('express');
const app=express()
const mongoose=require('mongoose')
const PORT=5000
const {MONGOURI}=require('./keys')



mongoose.connect(MONGOURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
mongoose.connection.on('connected',()=>{
    console.log("connected to mongo yeahh")
})
mongoose.connection.on('error',(err)=>{
    console.log("error while connecting",err)
})

require('./models/user')

app.use(express.json())
app.use(require('./routes/auth'))

app.listen(PORT,()=>{
    console.log("server is running",PORT)
})