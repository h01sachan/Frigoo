const jwt=require('jsonwebtoken')
const{JWT_SECRET}=require('../keys')
const mongoose=require('mongoose')
const User=mongoose.model("User")
const Feed=mongoose.model("Feed")
const Profile=mongoose.model("Profile")

/*exports.signup=(req,res,next)=>{
    const {email,name,password}=req.body
}*/


module.exports=(req,res,next)=>{
    const {authorization}=req.headers
    if(!authorization){
        return res.status(401).json({error:"you must be logged in"})
    }
    
    const token=authorization.replace("Bearer ","")
    
    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"you must be logged in"})
        }

        const {_id,name,email,followers,following,username,password,bookmark}=payload
        
        User.findById(_id).then(userdata=>{
            req.user=userdata
            next()
        })
        
    })
    
}