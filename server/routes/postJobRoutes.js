import express from 'express';
export const router = express.Router()
import { Job } from '../models/jobSchema.js';
import { checkCompany } from '../controllers/jobPostController.js';
import { getJobDetails, renderEditPage, updateJob, deleteJob } from '../controllers/jobPostController.js';

router.get('/post-job',(req, res) => {
    console.log('Rendering job post page for user:', req.session.user);
    res.render('job_post',{
        firstname: req.session.user ? req.session.user.firstname : null,
        isEditing : false
    });
});

router.post('/post-job', checkCompany,(req, res) => {

    console.log('Received job post data:', req.body);

    let newJob ={
        ...req.body,
        postedBy: req.session.user._id
    }

    Job.create(newJob);
    res.status(200).json({success: true, redirectUrl:"/"})

});

router.get('/:id', getJobDetails, (req, res) => {
    //69580eaadf721870f3fe5fbe
    const { job, company } = res.locals.data;
    let jobLocation = job.location || "Not specified";
    console.log({
        ...job,
        ...company,
        jobLocation: jobLocation,
    })
    res.render('jobOfferDetails', {
        ...job,
        ...company,
        jobLocation: jobLocation,
        userId : req.session.user._id
    });
});

router.get("/edit/:id", renderEditPage)
router.post("/update/:id", updateJob);

router.delete('/delete/:id', deleteJob);