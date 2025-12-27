const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  role: String,
  company: String,
  startYear: Number,
  endYear: Number,        
  description: String
});

const educationSchema = new mongoose.Schema({
  establishment: String,
  location: String,
  degree: String,
  year: Number
});

const certificationSchema = new mongoose.Schema({
  title: String,
  company: String,
  year: Number
});


const employeeSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    location: String,
    description: String,
    experiences: [experienceSchema],
    education: [educationSchema],
    certifications:[certificationSchema],
    skills: [String],
    languages: [String],
    profileImagePath: String,
    coverImagePath: String

}, { timestamps: true });

module.exports = mongoose.model('employees', employeeSchema);

