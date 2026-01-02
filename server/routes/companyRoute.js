import express from 'express';
import { upload } from '../middleware/upload.js'; 
import { createCompany } from '../controllers/createCompanyController.js';

const companyRouter = express.Router();

companyRouter.get('/create-company', (req, res) => res.redirect('/pages/createCompany.html'));

companyRouter.post('/create-company', upload.single('logo'), createCompany);

export default companyRouter;