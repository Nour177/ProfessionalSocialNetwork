import express from 'express';
const app = express();

const port = process.env.PORT || 3000;

app.get('/login', (req, res) => {
    res.send('/pages/login.html');
});

app.get('/register', (req, res) => {
    res.send('/pages/register.html');
});

app.post('/register', (req, res) => {
    // Registration logic here
    res.send('User registered');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
