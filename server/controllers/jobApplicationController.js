import Application from '../models/jobApplicationSchema.js';
import { Job } from '../models/jobSchema.js';

export const applyToJob = async (req, res) => {
    try {
        const { jobId } = req.body;
        const userId = req.session.user._id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({success: false ,message: "Job not found" });

        if (job.postedBy.toString() === userId) {
            return res.status(400).json({success: false ,message: "You cannot apply to your own job." });
        }

        const existingApplication = await Application.findOne({ jobId, applicantId: userId });
        if (existingApplication) {
            return res.status(400).json({success: false ,message: "You have already applied to this job." });
        }

        await Application.create({
            jobId,
            applicantId: userId
        });

        res.json({ success: true, message: "Application sent successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getJobApplicants = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.session.user._id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).send("Job not found");
        
        if (job.postedBy.toString() !== userId) {
            return res.status(403).send("Unauthorized: You are not the owner of this job.");
        }

        const applications = await Application.find({ jobId: jobId })
            .populate('applicantId', 'firstname lastname description profileImagePath email')
            .lean();

        console.log("job applications : ",applications)

        res.render('applicants-list', { 
            job: job, 
            applications: applications 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const { appId, status } = req.body;
        const userId = req.session.user._id; 

        const application = await Application.findById(appId).populate('jobId');

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        const job = await Job.findById(application.jobId);
        
        if (job.postedBy.toString() !== userId) {
             return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        application.status = status;
        await application.save();

        res.json({ success: true, message: "Status updated" });

    } catch (error) {
        console.error("Status update error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};