import Company from "../models/companySchema.js";

export const checkCompany = async (req, res, next) => {
    const email = req.session.user ? req.session.user.email : req.body.email;
    let domain = email.split('@')[1];
    let name = req.body.companyName;

    let existingCompany = await Company.findOne({ name: name }); 
    console.log('Existing Company:', existingCompany);
    if (!existingCompany) {
        return res.status(404).json({ 
            success: false, 
            message: "This company does not have a page yet. Please create the company page first." 
        });
    }

    if (existingCompany.domainName !== domain) {
        return res.status(403).json({ 
            success: false, 
            message: `You must have an email ending in @${existingCompany.domainName} to post jobs for this company.` 
        });
    }
    next();
};