import mongoose from "mongoose";


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
  recentJob: String,
  school: String,
  degree: String,
  fieldOfStudy: String,
  startYear: Number,
  endYear: Number,
  description: String,
  posts:[postSchema],
  experiences: [experienceSchema],
  education: [educationSchema],
  certifications:[certificationSchema],
  skills: [String],
  languages: [String],
  profileImagePath: String,
  coverImagePath: String

}, { timestamps: true });


employeeSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email });
};

export default mongoose.model('employee', employeeSchema);