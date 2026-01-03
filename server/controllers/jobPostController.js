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

export const renderEditPage = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        
        if (job.postedBy.toString() !== req.session.user._id) {
            return res.redirect('/'); 
        }

        res.render('job_post', { 
            job: job, 
            isEditing: true 
        });

    } catch (err) { 
        res.status(500).json({ message: err.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const updatedData = req.body; 

        const job = await Job.findById(jobId);
        if (job.postedBy.toString() !== req.session.user._id) {
            return res.status(403).send("Unauthorized");
        }

        await Job.findByIdAndUpdate(jobId, updatedData);

        console.log(`Job ${jobId} updated successfully`);

        res.json({ 
            success: true, 
            redirectUrl: `/jobs/${jobId}` 
        });

    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send("Server Error");
    }
};

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        if (job.postedBy.toString() !== req.session.user._id) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }

        await Job.findByIdAndDelete(jobId);

        res.json({ 
            success: true, 
            redirectUrl: '/pages/acceuil.html'
        });

    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
