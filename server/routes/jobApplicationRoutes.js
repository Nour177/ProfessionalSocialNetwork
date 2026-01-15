import express from 'express';
import { applyToJob, getJobApplicants, updateApplicationStatus } from '../controllers/jobApplicationController.js';

const jobApplicatinRoute = express.Router();

jobApplicatinRoute.post('/apply', applyToJob);

jobApplicatinRoute.get('/job/:jobId', getJobApplicants);

jobApplicatinRoute.post('/update-status', updateApplicationStatus);

export default jobApplicatinRoute;