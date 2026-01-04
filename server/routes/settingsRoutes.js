import express from 'express';
import {
    updateProfile,
    updateProfilePhoto,
    updateCoverPhoto,
    updateAccount,
    updatePrivacy,
    saveVideo, 
    saveVideoCompany
} from '../controllers/settingsController.js';
import { upload, uploadVideo } from '../middleware/upload.js';

const router = express.Router();

// Settings routes
router.put('/api/settings/profile', updateProfile);
router.put('/api/settings/profile-photo', upload.single('profileImage'), updateProfilePhoto);
router.put('/api/settings/cover-photo', upload.single('coverImage'), updateCoverPhoto);
router.put('/api/settings/account', updateAccount);
router.put('/api/settings/privacy', updatePrivacy);
router.put('/api/settings/profile-video', uploadVideo, saveVideo);
router.put('/api/settings/company-video', uploadVideo, saveVideoCompany);


export default router;

