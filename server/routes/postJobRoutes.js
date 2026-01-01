import express from 'express';
export const router = express.Router()
import { Job } from '../models/jobSchema.js';

router.get('/post-job', (req, res) => {
    console.log('Rendering job post page for user:', req.session.user);
    res.render('job_post',{firstname: req.session.user ? req.session.user.firstname : null});
});

router.post('/post-job', (req, res) => {

    console.log('Received job post data:', req.body);

    let newJob ={
        ...req.body
    }

    Job.create(newJob);
    res.status(200).json({success: true, redirectUrl:"/"})

});