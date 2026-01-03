import mongoose from "mongoose";
import employee from "./Employees.js";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
    employmentType: {
    type: String,
    required: true,
  },
    description: {
    type: String,
    required: true,
    }, 
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee',
        required: true
    }
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);