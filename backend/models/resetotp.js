
var mongoose = require('mongoose')
const resetSchema=new mongoose.Schema({
        resettoken: {
            type: String,
           require:true
          },
        resetotp:{
            type:String,
            require:true
        },
        email:{
            type:String,
            require:true
        },
        newpassword:{
            type:String,
            require:true
        },
        confirmpassword:{
            type:String,
            require:true
        }
})
resetSchema.index({ createdAt: 1 }, { expireAfterSeconds:36000 })
mongoose.model("resetOtp",resetSchema)
