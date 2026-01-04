import express from 'express';
import dotenv from 'dotenv';
import connectDB from './database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import postRoutes from './routes/postRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import companyProfileRoutes from './routes/companyProfileRoutes.js';
import { upload } from './middleware/upload.js';
import settingsRoutes from './routes/settingsRoutes.js';
import networkRoutes from './routes/networkRoutes.js';
import companyRouter from './routes/companyRoute.js';
import {router} from './routes/postJobRoutes.js'
import otherProfileRoutes from './routes/otherProfileRoutes.js';
import jobApplicatinRoute from './routes/jobApplicationRoutes.js';

import sessions from 'express-session';
import authRoutes from './routes/authRoute.js';

dotenv.config();
const app = express();

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
secret: "ty84fwir767", 
saveUninitialized: true, 
cookie: { maxAge: oneDay, secure: false }, 
resave: false
}));

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
app.use('/jobs', router);
app.use('/applications',jobApplicatinRoute)

connectDB();

const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes API pour les posts
app.use('/api/posts', postRoutes);

app.use('/', authRoutes);

app.use('/company', companyRouter);

// Profile routes
app.use(profileRoutes);
app.use(companyProfileRoutes);
app.use(otherProfileRoutes);



// Settings routes
app.use(settingsRoutes);

// Network routes
app.use(networkRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
