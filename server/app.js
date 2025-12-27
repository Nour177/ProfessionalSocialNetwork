require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const employee = require('./models/employeeSchema');

const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('connected'))
.catch(err => console.error('error:', err));



app.get('/', async (req, res) => {
    try {
        const users = await employee.find(); 
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching users');
    }
});






app.listen(process.env.PORT, () => {
    console.log(`erver running on http://localhost:${process.env.PORT}`);
});