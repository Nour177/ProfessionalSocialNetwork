import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    domainName: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
    industry: {
    type: String,
    required: true,
  },
    location: {
    type: String,
    required: true,
    },
    organizationSize: {
    type: String,
    required: true,
  },
    organizationType: {
    type: String,
    required: true,
  },
  logo : String,
  description: String,
  website: String,
});

export default mongoose.model("Company", companySchema);