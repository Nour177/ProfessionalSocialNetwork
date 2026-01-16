import express from 'express';
import {
    getProfile,
    redirectProfilePage,
    redirectCompanyProfilePage,
    getProfileById
    
} from '../controllers/otherProfileController.js';

const router = express.Router();

// Routes
router.get('/api/profile', getProfile);
router.get('/otherProfile', redirectProfilePage);
router.get('/otherCompany', redirectCompanyProfilePage);
router.get('/profile/:id', getProfileById);







export default router;
