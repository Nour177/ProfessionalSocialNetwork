import employee from '../models/Employees.js';
import Company from '../models/companySchema.js';

// Get profile
export const getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
    
    const user = await employee.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Redirect to profile page
export const redirectProfilePage = (req, res) => {
  res.redirect('/pages/otherProfile.html');
};


// Redirect to company profile page
export const redirectCompanyProfilePage = (req, res) => {
    res.redirect('/pages/otherCompanyProfile.html');
};