
var mongoose = require('mongoose')
const otpSchema=new mongoose.Schema({
        token: {
            type: String,
            require:true
          },
        otp:{
            type:String,
            require:true
        },
        email:{
            type:String,
            require:true
        }
})
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 })
mongoose.model("OtpUser",otpSchema)
