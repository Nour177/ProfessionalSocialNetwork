import express from 'express';
import {
    updateProfile,
    updateProfilePhoto,
    updateCoverPhoto,
    updateAccount,
    updatePrivacy
} from '../controllers/settingsController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Settings routes
router.put('/api/settings/profile', updateProfile);
router.put('/api/settings/profile-photo', upload.single('profileImage'), updateProfilePhoto);
router.put('/api/settings/cover-photo', upload.single('coverImage'), updateCoverPhoto);
router.put('/api/settings/account', updateAccount);
router.put('/api/settings/privacy', updatePrivacy);

export default router;

