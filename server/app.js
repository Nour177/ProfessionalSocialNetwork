import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import postRoutes from './routes/postRoutes.js';

import {router} from './routes/postJobRoutes.js'

import sessions from 'express-session';
import authRoutes from './routes/authRoute.js';

dotenv.config();
const app = express();

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
secret: "ty84fwir767", 
saveUninitialized: true, 
cookie: { maxAge: oneDay, secure: false }, 
resave: false
}));

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

connectDB();

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes API pour les posts
app.use('/api/posts', postRoutes);

app.use('/', authRoutes);

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
