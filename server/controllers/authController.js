import employee from '../models/Employees.js'; 
import axios from 'axios';


export const register = async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    let educationData = [];
    let experienceData = [];

    // Captcha Verification
    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    try {
        const recaptchaResponse = await axios.post(verificationURL);
        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA' });
    }

    // Data Parsing
    if (req.body.school) {
        educationData.push({
            school: req.body.school,
            degree: req.body.degree,
            fieldOfStudy: req.body.fieldOfStudy,
            startYear: req.body.startYear,
            endYear: req.body.endYear
        });
    }
    if (req.body.recentJob) {
        experienceData.push({
            role: req.body.recentJob,
        });
    }
    
    // Create User Object
    let userData = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        location: req.body.location,
        education: educationData,       
        experiences: experienceData,
        profileImagePath: req.file ? `/uploads/${req.file.filename}` : null,
    };

    // Save to DB
    try {
        const newEmployee = await employee.create(userData);
        const userResponse = newEmployee.toObject();
        delete userResponse.password;
        
        return res.status(200).json({ 
            success: true, 
            message: 'User added successfully',
            user: userResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let existingEmployee = await employee.findOne({ email });
        
        if (!existingEmployee || existingEmployee.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
        
        const userData = existingEmployee.toObject();
        delete userData.password;
        
        return res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const checkEmail = async (req, res) => {
    const { email } = req.body;
    let existingEmployee = await employee.findOne({ email }); 

    if (existingEmployee) {
        return res.status(200).json({ exists: true });
    } else {
        return res.status(200).json({ exists: false });
    }
};