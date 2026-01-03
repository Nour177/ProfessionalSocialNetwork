import express from 'express';

import {
  redirectCompanyProfilePage,
  getCompanyByAdminId,
  updateCompanyDescription
} from '../controllers/companyProfileController.js';

const router = express.Router();

// Route: Company profile page
router.get('/companyProfile', redirectCompanyProfilePage);

// Route: Get company by admin ID
router.get('/api/companies/admin/:adminId', getCompanyByAdminId);

router.put('/api/companies/description', updateCompanyDescription);


export default router;
