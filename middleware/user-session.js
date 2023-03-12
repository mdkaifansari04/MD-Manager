const session = require('express-session')

let uSession

let userSession = async(req,res,next) =>{

    uSession = req.session
    uSession.email = req.body.email
    console.log(uSession)

    await uSession.save((err)=>{
        if (err) {
            return next(err)
        }
    })
    next()
}

module.exports = userSession