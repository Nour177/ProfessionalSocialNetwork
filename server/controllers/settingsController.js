import employee from '../models/Employees.js';

import Company from '../models/companySchema.js';


// Update Profile Settings
export const updateProfile = async (req, res) => {
    const { email, firstname, lastname, company } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
    
    try {
        if (!firstname || firstname.trim() === '') {
            return res.status(400).json({ success: false, message: 'First name is required' });
        }
        
        // Si lastname est vide, on utilise firstname comme fallback
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
                    user.experiences[0].company = company.trim();
                } else {
                    user.experiences = [{ company: company.trim() }];
                }
                await user.save();
            }
        }
        
        // Récupérer l'ancien nom avant la mise à jour pour mettre à jour les posts (coherence )
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
        
        // le nouveau nom pour les posts 
        const newFullName = `${updatedUser.firstname} ${updatedUser.lastname}`.trim();
        if (oldFullName && oldFullName !== newFullName) {
            try {
                const Post = (await import('../models/post.js')).default;
                await Post.updateMany(
                    { author: oldFullName },
                    { $set: { author: newFullName } }
                );
                console.log(`Updated posts from "${oldFullName}" to "${newFullName}"`);
            } catch (updateError) {
                console.error('Error updating posts with new name:', updateError);
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
};

// Update Profile Photo
export const updateProfilePhoto = async (req, res) => {
    const { email } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; 

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
};

// Update Cover Photo
export const updateCoverPhoto = async (req, res) => {
    const { email } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; 
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
};

// Update Account Settings
export const updateAccount = async (req, res) => {
    const { email, newEmail, password } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; 
    
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
};

// Update Privacy Settings
export const updatePrivacy = async (req, res) => {
    const { email, publicProfile, allowSearchEngines } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com";
    
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
};


export const saveVideo = async (req, res) => {
    const { email } = req.body;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com" ; 

    try {

        const updateData = {};
        if (req.file) {
            updateData.videoPath = `/uploads/${req.file.filename}`;
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
        res.json({ success: true, message: 'Video saved successfully', user: userResponse });
    } catch (error) {
        console.error('Error saving video :', error);
        res.status(500).json({ success: false, message: 'Failed to save video' });
    }
};




export const saveVideoCompany = async (req, res) => {
    const { id } = req.body;
    const companyId = id  ; 

    try {

        const updateData = {};
        if (req.file) {
            updateData.video = `/uploads/${req.file.filename}`;
        }
        console.log()
        const company = await Company.findOneAndUpdate(
            { _id: companyId },
            { $set: updateData },
            { new: true }
        );


        if (!company) {
            return res.status(404).json({ success: false, message: 'company not found' });
        }

        const companyResponse = company.toObject();
        res.json({ success: true, message: 'Video saved successfully', company: companyResponse });
    } catch (error) {
        console.error('Error saving video :', error);
        res.status(500).json({ success: false, message: 'Failed to save video' });
    }
};
