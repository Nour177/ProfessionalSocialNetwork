import employee from '../models/Employees.js';

// Get profile
export const getProfile = async (req, res) => {
  try {
    const user = await employee.findOne({ email: "aziza@gmail.com" });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Redirect to profile page
export const redirectProfilePage = (req, res) => {
  res.redirect('/pages/myProfile.html');
};

// Edit description
export const editDescription = async (req, res) => {
  const { newDescription } = req.body;
  try {
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { description: newDescription },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, description: user.description });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  const { experience } = req.body;
  try {
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $push: { experiences: experience } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, experiences: user.experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Edit experience
export const editExperience = async (req, res) => {
  const { index, experience } = req.body;
  console.log(experience)
  try {
    const update = {};
    update[`experiences.${index}`] = experience;
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, experiences: user.experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add education
export const addEducation = async (req, res) => {
  const { education } = req.body;
  console.log(education)
  try {
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $push: { education } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, education: user.education });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Edit education
export const editEducation = async (req, res) => {
  const { index, education } = req.body;
  try {
    const update = {};
    update[`education.${index}`] = education;
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, education: user.education });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

export const deleteEducation = async (req, res) => {
  const { index } = req.body;

  try {
    const user = await employee.findOne({ email: "aziza@gmail.com" });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.education.splice(index, 1);
    await user.save();

    res.json({ success: true, education: user.education });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteExperience = async (req, res) => {
  const { index } = req.body;

  try {
    const user = await employee.findOne({ email: "aziza@gmail.com" });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.experiences.splice(index, 1);
    await user.save();

    res.json({ success: true, experience: user.experiences });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteSkill = async (req, res) => {
  const { index } = req.body;

  try {
    const user = await employee.findOne({ email: "aziza@gmail.com" });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.skills.splice(index, 1);
    await user.save();

    res.json({ success: true, skill: user.skills });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

export const deleteCertification = async (req, res) => {
  const { index } = req.body;

  try {
    const user = await employee.findOne({ email: "aziza@gmail.com" });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.certifications.splice(index, 1);
    await user.save();

    res.json({ success: true, certification: user.certifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

// Add skill
export const addSkill = async (req, res) => {
  const { skill } = req.body;
  try {
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $push: { skills: skill } },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, skill: user.skills });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};

// Add c
export const addCertification = async (req, res) => {
  const { certification } = req.body;
      console.log(certification);

  try {
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $push: { certifications: certification } },
      { new: true }
    );
  
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, certification: user.certifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};


// Edit Certification
export const editCertification = async (req, res) => {
  const { index, certification } = req.body;
  try {
    const update = {};
    update[`certifications.${index}`] = certification;
    const user = await employee.findOneAndUpdate(
      { email: "aziza@gmail.com" },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, certification: user.certifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
};