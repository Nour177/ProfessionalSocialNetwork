import employee from '../models/Employees.js';


// Get profile
export const getProfile = async (req, res) => {
  try {
    const { email, id } = req.query;
    
    let user;
    if (id) {
      user = await employee.findById(id).select('-password');
    } else {
      const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
      user = await employee.findOne({ email: userEmail });
    }
    
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

// Get ohter profile by id 
export const getProfileById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await employee.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.redirect(`/pages/otherProfile.html?userId=${userId}`);// fetch avec l'id
    } catch (err) {
        console.error('Error getting profile by ID:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};