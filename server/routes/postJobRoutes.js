import express from 'express';
export const router = express.Router()
import { Job } from '../models/jobSchema.js';
import { checkCompany } from '../controllers/jobPostController.js';
import { getJobDetails, renderEditPage, updateJob, deleteJob, getAllJobs } from '../controllers/jobPostController.js';
import Application from '../models/jobApplicationSchema.js';

router.get('/api/jobs', getAllJobs);

router.get('/post-job',(req, res) => {
    if (!req.session?.user) {
        return res.redirect('/pages/login.html');
    }
    console.log('Rendering job post page for user:', req.session.user);
    res.render('job_post',{
        firstname: req.session.user.firstname,
        isEditing : false
    });
});

router.post('/post-job', checkCompany,(req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({ success: false, message: "You must be logged in to post a job" });
    }

    console.log('Received job post data:', req.body);

    let newJob ={
        ...req.body,
        postedBy: req.session.user._id
    }

    Job.create(newJob).then(savedJob => {
        res.status(200).json({success: true, redirectUrl:"/"})
    }).catch(error => {
        res.status(500).json({success: false, message: error.message})
    });

});

router.get('/:id', getJobDetails, async (req, res) => {
    //69580eaadf721870f3fe5fbe
    const { job, company } = res.locals.data;
    let jobLocation = job.location || "Not specified";
    let jobId = job._id
    let hasApplied = false

    const existingApplication = await Application.findOne({ jobId, applicantId: req.session.user._id });
        if (existingApplication) {
            hasApplied = true
        }
    console.log({
        ...job,
        ...company,
        jobLocation: jobLocation,
    })
    res.render('jobOfferDetails', {
        ...job,
        ...company,
        jobLocation: jobLocation,
        userId : req.session.user._id || null,
        hasApplied : hasApplied
    });
});

router.get("/edit/:id", renderEditPage)
router.post("/update/:id", updateJob);

router.delete('/delete/:id', deleteJob);