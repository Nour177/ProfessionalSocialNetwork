import express from 'express';

import {
  redirectCompanyProfilePage,
  getCompanyByAdminId,
  updateCompanyDescription,
  updateCompanyCover, 
  updateCompanyLogo,
  updateCompanyDetails,
  getCompanyById,
  getCompanyByIdAPI
} from '../controllers/companyProfileController.js';

import { upload, uploadVideo } from '../middleware/upload.js';

const router = express.Router();

// Route: Company profile page
router.get('/companyProfile', redirectCompanyProfilePage);

// Route: Get company by admin ID
router.get('/api/companies/admin/:adminId', getCompanyByAdminId);

// Route: Get company by ID (for viewing other companies via API)
router.get('/api/companies/:id', getCompanyByIdAPI);

// Route to view company by ID (redirects to page)
router.get('/company/:id', getCompanyById);

router.put('/api/companies/description', updateCompanyDescription);
router.put('/api/companies/cover', upload.single('cover'), updateCompanyCover);
router.put('/api/companies/logo', upload.single('logo'), updateCompanyLogo);
router.put('/api/companies/details', updateCompanyDetails);


export default router;
