import express from 'express';
import { register, login, checkEmail } from '../controllers/authController.js';
import { upload } from '../middleware/upload.js'; 

const router = express.Router();

router.get('/login', (req, res) => res.redirect('/pages/login.html'));
router.get('/register', (req, res) => res.redirect('/pages/register.html'));


router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.post('/check-email', checkEmail);

export default router;