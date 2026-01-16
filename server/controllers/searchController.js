import employee from '../models/Employees.js';
import { Job } from '../models/jobSchema.js';
import Company from '../models/companySchema.js';

export const searchAll = async (req, res) => {
    try {
        const { q, type } = req.query;
        const searchTerm = q?.trim() || '';
        const searchType = type?.toLowerCase() || 'all'; //all,profiles,jobs,companies

        if (!searchTerm) {
            return res.json({
                success: true,
                profiles: [],
                jobs: [],
                companies: []
            });
        }

        const results = {
            profiles: [],
            jobs: [],
            companies: []
        };

        // Search profiles 
        if (searchType === 'all' || searchType === 'profiles') {
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
            
            const queryConditions = [
                { firstname: { $regex: searchTerm, $options: 'i' } },
                { lastname: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
                { skills: { $in: [new RegExp(searchTerm, 'i')] } }
            ];
            // full name search
            if (searchWords.length >= 2) {
                queryConditions.push({
                    $and: [
                        { firstname: { $regex: searchWords[0], $options: 'i' } },
                        { lastname: { $regex: searchWords[1], $options: 'i' } }
                    ]
                });
                //reverse cas 
                if (searchWords.length === 2) {
                    queryConditions.push({
                        $and: [
                            { firstname: { $regex: searchWords[1], $options: 'i' } },
                            { lastname: { $regex: searchWords[0], $options: 'i' } }
                        ]
                    });
                }
            }
            
            const profileQuery = {
                $or: queryConditions,
                publicProfile: true //public
            };

            const profiles = await employee
                .find(profileQuery)
                .select('firstname lastname description location profileImagePath skills _id')
                .limit(20)
                .lean();

            results.profiles = profiles.map(profile => ({
                _id: profile._id,
                firstname: profile.firstname,
                lastname: profile.lastname,
                fullName: `${profile.firstname} ${profile.lastname}`,
                description: profile.description || '',
                location: profile.location || '',
                profileImagePath: profile.profileImagePath || '/images/profile.png',
                skills: profile.skills || []
            }));
        }

        // Search jobs
        if (searchType === 'all' || searchType === 'jobs') {
            const jobQuery = {
                $or: [
                    { title: { $regex: searchTerm, $options: 'i' } },
                    { companyName: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { location: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            const jobs = await Job
                .find(jobQuery)
                .select('title companyName location employmentType description _id createdAt')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            results.jobs = jobs.map(job => ({
                _id: job._id,
                title: job.title,
                companyName: job.companyName,
                location: job.location || 'Not specified',
                employmentType: job.employmentType,
                description: job.description ? job.description.substring(0, 150) + '...' : '',
                createdAt: job.createdAt
            }));
        }

        // Search companies
        if (searchType === 'all' || searchType === 'companies') {
            const companyQuery = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { industry: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { location: { $regex: searchTerm, $options: 'i' } }
                ]
            };

            const companies = await Company
                .find(companyQuery)
                .select('name industry location description logo _id')
                .limit(20)
                .lean();

            results.companies = companies.map(company => ({
                _id: company._id,
                name: company.name,
                industry: company.industry || '',
                location: company.location || '',
                description: company.description ? company.description.substring(0, 150) + '...' : '',
                logo: company.logo || '/images/default-company.png'
            }));
        }

        res.json({
            success: true,
            query: searchTerm,
            ...results
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
};
