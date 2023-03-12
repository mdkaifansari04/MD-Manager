const express = require('express')
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser")
const flash = require('connect-flash')
const Admin = require('../models/admin')
const userSession = require('../middleware/user-session')
const nodemailer = require("nodemailer")
const otpSession = require('../middleware/otp')
const session = require('express-session')

const app = express()
const router = express.Router()

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

router.post("/login", async (req, res) => {
    try {
        const foundUser = await Admin.findOne({ email: req.body.email })

        if (foundUser) {
            const result = await bcrypt.compare(req.body.password, foundUser.password)
            if (result) {

                userSession(req, res, () => {
                    console.log("Middleware called")
                })
                req.flash('message', "Logined")
                res.redirect('/')

            } else {
                req.flash("alert", "Wrong Password")
                res.redirect('/login')
            }
        } else {
            req.flash("alert", "Wrong Credentials")
            res.redirect('/login')
        }

    } catch (error) {
        res.send("Server Error : " + error)
    }
})


router.get('/signup', async (req, res) => {
    let alert = req.flash('alert')
    let foundAdmin = await Admin.find({})


    if (foundAdmin.length == 0) {

        if (req.session.email) {
            res.render('signup', {
                specialOption: '',
                option: "Logout",
                alertMessage: alert
            })
        } else {
            res.render('signup', {
                specialOption: "hidden",
                option: "Login",
                alertMessage: alert
            })
        }
    }
    else {
        res.send("Admin has already been registered")
    }
})


router.post('/signup', async (req, res) => {

    try {
        if (req.body.password == req.body.confirmPassword) {
            bcrypt.hash(req.body.password, 10, async function (err, hash) {
                const newAdmin = await new Admin({
                    email: req.body.email,
                    password: hash
                })
                newAdmin.save()
                    .then(() => {
                        userSession(req, res, () => {
                            console.log("Middleware called")
                        })

                        req.flash("message", "Admin created")
                        res.redirect('/')
                        console.log('Admin created');

                    })
                    .catch((err) => {

                        req.flash('alert', err)
                        res.redirect('/admin/register')
                        console.log('Saving err : ' + err);
                    })
            });
        } else {
            req.flash("alert", "Password not mathed")
            res.redirect('/admin/signup')
        }
    } catch (error) {
        res.send("Server Error" + error)
    }
})

router.get('/login/forgot',otpSession, async (req, res) => {
    let alert = req.flash('alert')
    let admin = await Admin.findOne({})
    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "testappemail100@gmail.com",
            pass: "xieqspdammnhdxou",
        },
    })

    let info = await transporter.sendMail({
        from: 'mdManager.gmail.com', // sender address
        to: `${admin.email}`, // list of receivers
        subject: `OTP for varification `, // Subject line
        html: `<b>OTP for login  ${req.session.otp}</b><br>
                        <hr>
                        <h5>If not done by you contact your technical support team</h5>
                        <h5>Save this message for future purposes</h5>
                        `, // html body
    }).then(() => {
        res.render('acception/otp', {
            email: admin.email,
            alertMessage : alert
        })
        console.log("Sent mail ")
    })
    .catch(err =>
            res.render('acception/otp', {
            email: admin.email,
            alertMessage : alert
        }))
})


router.post('/otp', (req, res) => {
    try {
        let alert = req.flash('alert')
        let otp = req.session.otp
        if( otp == req.body.otp){
            res.render('acception/updatePassword', {
                alertMessage : alert
            })
        } else{
            req.flash("alert", "Wrong OTP, An another OTP is send to your email")
            res.redirect('/admin/login/forgot')
        }
    } catch (error) {
        res.send("Server Error : " + error)
    }
})


router.patch('/updatePassword', (req,res) =>{
    if (req.body.password == req.body.confirmPassword) {
        bcrypt.hash(req.body.password, 10, async function (err, hash) {
            if (err) {
                res.send(err)
            } else {

                let foundAdmin = await Admin.findOne({})
                console.log(foundAdmin)
                await Admin.findOneAndUpdate({}, {
                    $set:{
                        password : hash
                    }
                }).then(() =>{
                    req.flash("message", "Password Updated")
                    req.session.email = foundAdmin.email
                    res.redirect('/')
                })
                .catch((err) =>{
                    res.render('acception/updatePassword', {
                        alertMessage : "Something went wrong, Please try again"
                    })
                })
            }
        })
    } else {
        res.render('acception/updatePassword', {
            alertMessage : "Password is not same"
        })
    }
})

// email = amdkaif843@gmail.com
// pass = admin123

module.exports = router;