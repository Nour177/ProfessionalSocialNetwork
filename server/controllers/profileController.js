import employee from '../models/Employees.js';

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
  res.redirect('/pages/myProfile.html');
};

// Edit description
export const editDescription = async (req, res) => {
  const { email, newDescription } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  try {
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { description: newDescription },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Description updated!', description: user.description, user: userResponse });
  } catch (err) {
    console.error('Error updating description:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  const { email, experience } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Adding experience:', experience, 'for user:', userEmail);
  try {
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $push: { experiences: experience } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ 
      success: true, 
      message: 'Experience added!', 
      experiences: user.experiences,
      user: userResponse 
    });
  } catch (err) {
    console.error('Error adding experience:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Edit experience
export const editExperience = async (req, res) => {
  const { email, index, experience } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Editing experience:', experience, 'at index:', index, 'for user:', userEmail);
  try {
    const update = {};
    update[`experiences.${index}`] = experience;
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Experience updated!', user: userResponse });
  } catch (err) {
    console.error('Error updating experience:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add education
export const addEducation = async (req, res) => {
  const { email, education } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Adding education:', education, 'for user:', userEmail);
  try {
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $push: { education: education } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ 
      success: true, 
      message: 'Education added!', 
      education: user.education,
      user: userResponse 
    });
  } catch (err) {
    console.error('Error adding education:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Edit education
export const editEducation = async (req, res) => {
  const { email, index, education } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Editing education:', education, 'at index:', index, 'for user:', userEmail);
  try {
    const update = {};
    update[`education.${index}`] = education;
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Education updated!', user: userResponse });
  } catch (err) {
    console.error('Error updating education:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

export const deleteEducation = async (req, res) => {
  const { email, index } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité

  try {
    const user = await employee.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.education.splice(index, 1);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, education: user.education, user: userResponse });
  } catch (err) {
    console.error('Error deleting education:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteExperience = async (req, res) => {
  const { email, index } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité

  try {
    const user = await employee.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.experiences.splice(index, 1);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, experiences: user.experiences, user: userResponse });
  } catch (err) {
    console.error('Error deleting experience:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteSkill = async (req, res) => {
  const { email, index } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité

  try {
    const user = await employee.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.skills.splice(index, 1);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, skills: user.skills, user: userResponse });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteCertification = async (req, res) => {
  const { email, index } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité

  try {
    const user = await employee.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.certifications.splice(index, 1);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, certifications: user.certifications, user: userResponse });
  } catch (err) {
    console.error('Error deleting certification:', err);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

// Add skill
export const addSkill = async (req, res) => {
  const { email, skill } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Adding skill:', skill, 'for user:', userEmail);
  try {
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $push: { skills: skill } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Skill added!', skills: user.skills, user: userResponse });
  } catch (err) {
    console.error('Error adding skill:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add certification
export const addCertification = async (req, res) => {
  const { email, certification } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Adding certification:', certification, 'for user:', userEmail);

  try {
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $push: { certifications: certification } },
      { new: true }
    );
  
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Certification added!', certifications: user.certifications, user: userResponse });
  } catch (err) {
    console.error('Error adding certification:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};


// Edit Certification
export const editCertification = async (req, res) => {
  const { email, index, certification } = req.body;
  const userEmail = email || req.session?.user?.email || "aziza@gmail.com"; // Fallback pour compatibilité
  
  console.log('Editing certification:', certification, 'at index:', index, 'for user:', userEmail);
  try {
    const update = {};
    update[`certifications.${index}`] = certification;
    const user = await employee.findOneAndUpdate(
      { email: userEmail },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'Certification updated!', certifications: user.certifications, user: userResponse });
  } catch (err) {
    console.error('Error updating certification:', err);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};