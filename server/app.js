import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

import companyRouter from './routes/companyRoute.js';
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

app.use('/company', companyRouter);

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
