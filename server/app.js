import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import axios from 'axios';
import postRoutes from './routes/postRoutes.js';

import {router} from './routes/jobs.js'

import sessions from 'express-session';


const oneDay = 1000 * 60 * 60 * 24;

dotenv.config();
const app = express();

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/jobs', router);

app.use(sessions({
secret: "ty84fwir767", 
saveUninitialized: true, 
cookie: { maxAge: oneDay, secure: false }, 
resave: false
}));

connectDB();

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //set the destination folder for uploaded files
    cb(null, path.join(__dirname, '../public/uploads')); 
  },
  filename: (req, file, cb) => {
    //create a unique filename for each uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes API pour les posts
app.use('/api/posts', postRoutes);

app.get('/login', (req, res) => {
    res.redirect('/pages/login.html');
});

app.get('/register', (req, res) => {
    res.redirect('/pages/register.html');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body.email);
    let existingEmployee = await employee.findByEmail(email);
    console.log("employee",existingEmployee);
    console.log(password);
    if (!existingEmployee || existingEmployee.password !== password) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    req.session.firstname = existingEmployee.firstname;
    return res.status(200).json({ success: true, message: 'Login successful' });
});

app.post('/register', upload.single('profileImage'), async (req, res) => {

    console.log(req.body);
    console.log(req.file);

    let educationData = [];
    let experienceData = [];

    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    
    try {
        const recaptchaResponse = await axios.post(verificationURL);
        const recaptchaData = recaptchaResponse.data;
        if (!recaptchaData.success) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA' });
    }

    if (req.body.school) {
        educationData.push({
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            startYear: req.body.startYear,
            endYear: req.body.endYear
        });
    }
    if (req.body.recentJob) {
        experienceData.push({
            role: req.body.recentJob,
        });
    }
    let userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        location: req.body.location,
        
        education: educationData,       
        experiences: experienceData,

        profileImagePath: req.file ? `/uploads/${req.file.filename}` : null,
    };

    employee.create(userData);
    return res.status(200).json({ success:true, message: 'User added successfully' });
});

app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    let existingEmployee = await employee.findByEmail(email);

    if (existingEmployee) {
        return res.status(200).json({ exists: true });
    } else {
        return res.status(200).json({ exists: false });
    }
});

app.get('/api/myProfile', async (req, res) => {
    let user = await employee.findByEmail("aziza@gmail.com");
    res.json(user);
});

app.get('/myProfile', (req, res) => {
    res.redirect('/pages/myProfile.html');
});

app.put('/edit/editInfos', async (req, res) => {
    const { newDescription } = req.body;

    try {
        const user = await employee.findOneAndUpdate(
            { email: "aziza@gmail.com" },
            { description: newDescription },
            { new: true }

        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'Description updated!', description: user.description });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/editExperience', async (req, res) => {
    const { index, experience } = req.body;

    try {
        const update = {};
        update[`experiences.${index}`] = experience;

        const user = await employee.findOneAndUpdate(
            { email: "aziza@gmail.com" },
            { $set: update },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'Description updated!', description: user.description });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});


app.put('/edit/addExperience', async (req, res) => {
    const { experience } = req.body;
    console.log(experience);
    try {
        const user = await employee.findOneAndUpdate(
            { email: "aziza@gmail.com" },
            { $push: { experiences: experience } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Experience added!',
            experiences: user.experiences
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/addEducation', async (req, res) => {
    const { education } = req.body;
    console.log(education);
    try {
        const user = await employee.findOneAndUpdate(
            { email: "aziza@gmail.com" },
            { $push: { education: education } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Education added!',
            experiences: user.experiences
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/editEducation', async (req, res) => {
    const { index, education } = req.body;

    try {
        const update = {};
        update[`education.${index}`] = education;

        const user = await employee.findOneAndUpdate(
            { email: "aziza@gmail.com" },
            { $set: update },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'Description updated!', description: user.description });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
