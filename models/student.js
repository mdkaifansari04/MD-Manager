const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name: String,
    enrollmentNo : {
        type : Number,
        unique : true
    },
    email : {
        type : String,
        unique : true
    },
    
    branch : String,
    semester: String,
    address: String,
    phoneNo : Number,
    pincode : Number,
    paid : Number,
    totalFees : Number
})

const student = mongoose.model('student', studentSchema)

module.exports = student;