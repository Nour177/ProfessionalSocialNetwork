import Company from '../models/companySchema.js';

// Redirect to company profile page
export const redirectCompanyProfilePage = (req, res) => {
  res.redirect('/pages/companyProfile.html');
};

// Get company by admin ID
export const getCompanyByAdminId = async (req, res) => {
  try {
    const company = await Company.findOne({ admin: req.params.adminId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Update company description
export const updateCompanyDescription = async (req, res) => {
    const { companyId, description } = req.body;

    if (!companyId || description === undefined) {
        return res.status(400).json({ success: false, message: 'Company ID and description are required' });
    }

    try {
        const company = await Company.findByIdAndUpdate(
            companyId,
            { description: description },
            { new: true } // return updated document
        );

        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        res.json({ success: true, company });
    } catch (err) {
        console.error('Error updating company description:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
