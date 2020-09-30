
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
        }
})
resetSchema.index({ createdAt: 1 }, { expireAfterSeconds:3600 })
mongoose.model("resetOtp",resetSchema)
