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

        res.render('applicants-list', { 
            job: job, 
            applications: applications 
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};