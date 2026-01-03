import Company from "../models/companySchema.js";
import {Job} from "../models/jobSchema.js";
import employee from "../models/Employees.js";

export const checkCompany = async (req, res, next) => {
    const email = req.session.user ? req.session.user.email : req.body.email;
    let domain = email.split('@')[1];
    let name = req.body.companyName;

    let existingCompany = await Company.findOne({ name: name }); 
    console.log('Existing Company:', existingCompany);
    if (!existingCompany) {
        return res.status(404).json({ 
            success: false, 
            message: "This company does not have a page yet. Please create the company page first." 
        });
    }

    if (existingCompany.domainName !== domain) {
        return res.status(403).json({ 
            success: false, 
            message: `You must have an email ending in @${existingCompany.domainName} to post jobs for this company.` 
        });
    }
    next();
};

export const getJobDetails = async (req, res, next) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId).populate('postedBy', 'firstname lastname description profileImagePath');
        if (!job) return res.status(404).json({ message: "Job not found" });

        const company = await Company.findOne({ name: job.companyName }).lean();

        const responseData = {
            job: job,
            company: company || {} 
        };

        res.locals.data = responseData;
        next();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};