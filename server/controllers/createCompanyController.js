import Company from '../models/companySchema.js';

export const createCompany = async (req, res) => {

    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;
    console.log('Received company data:', logoPath);
    const company = new Company({
        name: req.body.name,
        domainName: req.body.domainName,
        location: req.body.headquarters,
        organizationSize: req.body.organizationSize,
        organizationType: req.body.organizationType,
        industry: req.body.industry,
        description: req.body.description,
        logo: logoPath,
        admin: req.session.user._id
    });

    try {
        await company.save();
        res.status(201).json({redirectUrl: '/company/create-company', success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
}