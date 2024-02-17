const express = require('express')
const bodyParser = require("body-parser")
const nodemailer = require("nodemailer")
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const Student = require("../models/student")

const router = express.Router()
const app = express()
const formData = new FormData()

app.use(bodyParser.urlencoded({ extended: true }))



//GET STUDENT BY ID
router.get('/id/:id', async (req, res) => {
    try {
        let foundStudent = await Student.findOne({ _id: req.params.id })

        if (foundStudent) {
            console.log(foundStudent);
            let message = req.flash("message")
            if (req.session.email) {
                res.render('student', {
                    message: message,
                    specialOption: '',
                    option: "Logout",
                    student: foundStudent
                })
            } else {
                res.render('student', {
                    message: message,
                    specialOption: "hidden",
                    option: "Login",
                    student: foundStudent
                })
            }
        } else {
            req.flash('alert', 'Student not found')
            res.redirect('/')
        }
    } catch (error) {
        res.send("server error : " + error)
    }
})
//GET STUDENT BY ID

router.get('/name/', async(req,res) =>{
    console.log(req.query.search)
    let student = await Student.find({name : req.query.search})
    console.log(student)

    if (student) {
        let message = req.flash("message")
        if (req.session.email) {
            res.render('index', {
                message: message,
                specialOption: '',
                option: "Logout",
                Students: student
            })
        } else {
            res.render('index', {
                message: message,
                specialOption: "hidden",
                option: "Login",
                Students: student
            })
        }
    } else {
        req.flash('alert', 'Student not found')
        res.redirect('/')
    }
})


// ONLY ADMIN
router.post("/register", async (req, res) => {
    try {
        const newStudent = new Student({
            name: req.body.name,
            enrollmentNo: req.body.enrollmentNo,
            email: req.body.email,
            branch: req.body.branch,
            semester: req.body.semester,
            address: req.body.address,
            phoneNo: req.body.phoneNo,
            pincode: req.body.pincode,
            paid: 0,
            totalFees: req.body.totalFees
        })

        newStudent.save()
            .then(() => {
                req.flash("message", "Registered Student")
                res.redirect('/registration')
            })
            .catch((err) => {
                req.flash('alert', 'This email has already been registered')
                res.redirect('/register')
            })
    } catch (error) {
        res.send("Server error : " + error)
    }
})

// ONLY ADMIN
router.patch('/submission', async (req, res) => {
    try {
        const requestedStudent = await Student.findOne({ email: req.body.email })
        if (requestedStudent) {
            let reamainingFee = parseInt(requestedStudent.totalFees) - parseInt(requestedStudent.paid)

            if (req.body.amount > reamainingFee) {
                req.flash('alert', 'Amount is greater')
                res.redirect('/submission')
            } else {

                let paidAmount = parseInt(requestedStudent.paid)
                let updatedPaid = parseInt(paidAmount) + parseInt(req.body.amount)

                let r = parseInt(requestedStudent.totalFees) - updatedPaid

                const update = await Student.updateOne({ email: req.body.email }, { $set: { paid: updatedPaid } })

                    .then(async () => {
                        req.flash("message", "Transaction Completed")
                        res.redirect('/submission')

                        let testAccount = await nodemailer.createTestAccount();
                        let transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 587,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: "stuartansari3@gmail.com",
                                pass: "lesnqteupxdfzcfz",
                            },
                        });
                        let date = new Date()
                        let info = await transporter.sendMail({
                            from: 'mdManager.gmail.com', // sender address
                            to: `${requestedStudent.email}`, // list of receivers
                            subject: `Fee Submited Successfully on ${date} `, // Subject line
                            text: `Hello `, // plain text body
                            html: `<b>Dear ${requestedStudent.name}, Your fees is submited successfully</b><br>
                            <h3>Details</h3>
                            <p>Amount Paid   : ${req.body.amount}</p>
                            <p>Enrollment No : ${requestedStudent.enrollmentNo}</p>
                            <p>Total Fees    : ${requestedStudent.totalFees}</p>
                            <p>Remaining Fee : ${r}</p>
                            <p>Amount received by   : ${req.session.email}</p><br>
                        <hr>
                        <h5>If not done by you contact your office accountant</h5>
                        <h5>Save this message for future purposes</h5>
                        `, // html body
                        }).then(() => {
                            console.log("Sent mail ")
                        })
                            .catch(err => console.log(err))
                    })
            }
        } else {
            req.flash('alert', 'Wrong email address')
            res.redirect('/submission')
        }
    } catch (error) {
        res.send("Server Error : " + error)
    }
})


router.delete('/delete/:id', async (req, res) => {
    try {
        let foundStudent = await Student.findOne({ _id: req.params.id })
        if (foundStudent) {
            foundStudent.deleteOne()
                .then(() => {
                    req.flash("message", "Deleted Student")
                    res.redirect('/')
                })
                .catch((err) => {
                    res.send("Deleting Error : " + err)
                })
        } else {
            res.send("no such user")
        }
    } catch (error) {
        res.send("Server error : " + error)
    }
})


module.exports = router;
