const session = require('express-session')

let otp

let otpSession = async(req,res,next) =>{

    otp = req.session
    otp.otp = Math.floor(Math.random()*10000)
    
    console.log(otp);
    await otp.save((err)=>{
        if (err) {
            return next(err)
        }
    })
    next()
}

module.exports = otpSession