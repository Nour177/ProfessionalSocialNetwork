import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import employee from './models/Employees.js';
import axios from 'axios';
import postRoutes from './routes/postRoutes.js';

dotenv.config();
const app = express();

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
connectDB();

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //set the destination folder for uploaded files
    cb(null, path.join(__dirname, '../public/uploads')); 
  },
  filename: (req, file, cb) => {
    //create a unique filename for each uploaded file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes API pour les posts
app.use('/api/posts', postRoutes);

app.get('/login', (req, res) => {
    res.redirect('/pages/login.html');
});

app.get('/register', (req, res) => {
    res.redirect('/pages/register.html');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body.email);
    let existingEmployee = await employee.findByEmail(email);
    console.log("employee",existingEmployee);
    console.log(existingEmployee.password);
    console.log(password);
    if (!existingEmployee || existingEmployee.password !== password) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    return res.status(200).json({ success: true, message: 'Login successful' });
});

app.post('/register', upload.single('profileImage'), async (req, res) => {

    console.log(req.body);
    console.log(req.file);

    const recaptchaToken = req.body['g-recaptcha-response'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
    
    try {
        const recaptchaResponse = await axios.post(verificationURL);
        const recaptchaData = recaptchaResponse.data;
        if (!recaptchaData.success) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA' });
    }

    let existingEmployee = await employee.findByEmail(req.body.email);
    console.log(existingEmployee);
    if (existingEmployee) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    let userData = {
        ...req.body,
        profileImagePath: req.file ? `/uploads/${req.file.filename}` : null,
    }
    console.log("userData : ",userData);

    employee.create(userData);
    return res.status(200).json({ success:true, message: 'User added successfully' });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
