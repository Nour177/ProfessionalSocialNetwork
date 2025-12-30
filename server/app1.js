import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
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
    console.log("employee", existingEmployee);
    console.log(existingEmployee.password);
    console.log(password);
    if (!existingEmployee || existingEmployee.password !== password) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    return res.status(200).json({ success: true, message: 'Login successful' });
});

app.post('/register', upload.single('profileImage'), async (req, res) => {

    console.log(req.body);
    console.log(req.file);

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

    let existingEmployee = await employee.findByEmail(req.body.email);
    console.log(existingEmployee);
    if (existingEmployee) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    let userData = {
        ...req.body,
        profileImagePath: req.file ? `/uploads/${req.file.filename}` : null,
    }
    console.log("userData : ", userData);

    employee.create(userData);
    return res.status(200).json({ success: true, message: 'User added successfully' });
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