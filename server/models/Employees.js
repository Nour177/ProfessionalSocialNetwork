import mongoose from "mongoose";
import Post from "./post.js";


const experienceSchema = new mongoose.Schema({
  role: String,
  company: String,
  startYear: Number,
  endYear: Number,        
  description: String
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  startYear: Number,
  endYear: Number,

});

const certificationSchema = new mongoose.Schema({
  title: String,
  company: String,
  year: Number
});

const employeeSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
    password: {
    type: String,
    required: true,
  },
    location: {
    type: String,
    required: true,
  },

  profileImagePath: String,
  description: String,
  //posts:[Post],
  experiences: [experienceSchema],
  education: [educationSchema],
  certifications:[certificationSchema],
  skills: [String],
  languages: [String],
  profileImagePath: String,
  coverImagePath: String,
  publicProfile: {
    type: Boolean,
    default: true
  },
  allowSearchEngines: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


employeeSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email });
};

employeeSchema.methods.addEducation = function (edu) {
  this.education.push(edu);
  return this.save();
};

employeeSchema.methods.addExperience = function (exp) {
  this.experiences.push(exp);
  return this.save();
}

export default mongoose.model('employee', employeeSchema);