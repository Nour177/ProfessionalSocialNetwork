import express from 'express';
import { applyToJob, getJobApplicants } from '../controllers/jobApplicationController.js';

const jobApplicatinRoute = express.Router();

jobApplicatinRoute.post('/apply', applyToJob);

jobApplicatinRoute.get('/job/:jobId', getJobApplicants);

export default jobApplicatinRoute;