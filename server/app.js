import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import axios from 'axios';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

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
    try {
    let existingEmployee = await employee.findByEmail(email);
        
    if (!existingEmployee || existingEmployee.password !== password) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
        
        // Retourner les données utilisateur (sans le mot de passe)
        const userData = existingEmployee.toObject();
        delete userData.password;
        
        return res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
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
    }

    const newEmployee = await employee.create(userData);
    
    // Retourner les données utilisateur (sans le mot de passe)
    const userResponse = newEmployee.toObject();
    delete userResponse.password;
    
    return res.status(200).json({ 
        success: true, 
        message: 'User added successfully',
        user: userResponse
    });
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
    const { email, newDescription } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité

    try {
        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { description: newDescription },
            { new: true }

        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, message: 'Description updated!', description: user.description, user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/editExperience', async (req, res) => {
    const { email, index, experience } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité

    try {
        const update = {};
        update[`experiences.${index}`] = experience;

        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: update },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, message: 'Experience updated!', user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});


app.put('/edit/addExperience', async (req, res) => {
    const { email, experience } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité
    console.log(experience);
    try {
        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $push: { experiences: experience } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({
            success: true,
            message: 'Experience added!',
            experiences: user.experiences,
            user: userResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/addEducation', async (req, res) => {
    const { email, education } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité
    console.log(education);
    try {
        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $push: { education: education } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({
            success: true,
            message: 'Education added!',
            education: user.education,
            user: userResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

app.put('/edit/editEducation', async (req, res) => {
    const { email, index, education } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité

    try {
        const update = {};
        update[`education.${index}`] = education;

        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: update },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, message: 'Education updated!', user: userResponse });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// Update Profile Settings
app.put('/api/settings/profile', async (req, res) => {
    const { email, firstname, lastname, company } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité
    
    try {
        // Valider que firstname et lastname sont fournis et non vides
        if (!firstname || firstname.trim() === '') {
            return res.status(400).json({ success: false, message: 'First name is required' });
        }
        
        // Si lastname est vide, utiliser firstname comme fallback
        const validLastname = (lastname && lastname.trim() !== '') ? lastname.trim() : firstname.trim();
        
        const updateData = {
            firstname: firstname.trim(),
            lastname: validLastname
        };
        
        // Update company in first experience if provided
        if (company !== undefined && company.trim() !== '') {
            const user = await employee.findByEmail(userEmail);
            if (user) {
                if (user.experiences && user.experiences.length > 0) {
                    // Update first experience company
                    user.experiences[0].company = company.trim();
                } else {
                    // Create first experience with company
                    user.experiences = [{ company: company.trim() }];
                }
                await user.save();
            }
        }
        
        // Récupérer l'ancien nom avant la mise à jour pour mettre à jour les posts
        const oldUser = await employee.findByEmail(userEmail);
        const oldFullName = oldUser ? `${oldUser.firstname} ${oldUser.lastname}`.trim() : null;
        
        const updatedUser = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Mettre à jour les posts existants avec le nouveau nom
        const newFullName = `${updatedUser.firstname} ${updatedUser.lastname}`.trim();
        if (oldFullName && oldFullName !== newFullName) {
            try {
                const Post = (await import('./models/post.js')).default;
                await Post.updateMany(
                    { author: oldFullName },
                    { $set: { author: newFullName } }
                );
                console.log(`Updated posts from "${oldFullName}" to "${newFullName}"`);
            } catch (updateError) {
                console.error('Error updating posts with new name:', updateError);
                // Ne pas faire échouer la requête si la mise à jour des posts échoue
            }
        }
        
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.json({ success: true, message: 'Profile updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating profile:', error);
        const errorMessage = error.message || 'Failed to update profile';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

// Update Profile Photo
app.put('/api/settings/profile-photo', upload.single('profileImage'), async (req, res) => {
    const { email } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité

    try {
        const updateData = {};
        if (req.file) {
            updateData.profileImagePath = `/uploads/${req.file.filename}`;
        }

        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, message: 'Profile photo updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating profile photo:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile photo' });
    }
});

// Update Cover Photo
app.put('/api/settings/cover-photo', upload.single('coverImage'), async (req, res) => {
    const { email } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité

    try {
        const updateData = {};
        if (req.file) {
            updateData.coverImagePath = `/uploads/${req.file.filename}`;
        }

        const user = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ success: true, message: 'Cover photo updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating cover photo:', error);
        res.status(500).json({ success: false, message: 'Failed to update cover photo' });
    }
});

// Update Account Settings
app.put('/api/settings/account', async (req, res) => {
    const { email, newEmail, password } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité
    
    try {
        const updateData = {};
        
        if (newEmail && newEmail !== userEmail) {
            // Check if new email already exists
            const existingUser = await employee.findByEmail(newEmail);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
            updateData.email = newEmail;
        }
        
        if (password) {
            updateData.password = password;
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: 'No changes to update' });
        }
        
        const updatedUser = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.json({ success: true, message: 'Account updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ success: false, message: 'Failed to update account' });
    }
});

// Update Privacy Settings
app.put('/api/settings/privacy', async (req, res) => {
    const { email, publicProfile, allowSearchEngines } = req.body;
    const userEmail = email || "aziza@gmail.com"; // Fallback pour compatibilité
    
    try {
        const updateData = {
            publicProfile: publicProfile,
            allowSearchEngines: allowSearchEngines
        };
        
        const updatedUser = await employee.findOneAndUpdate(
            { email: userEmail },
            { $set: updateData },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        
        res.json({ success: true, message: 'Privacy settings updated successfully', user: userResponse });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update privacy settings' });
    }
});
app.use(profileRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
