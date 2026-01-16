import express from 'express';
import { searchAll } from '../controllers/searchController.js';

export const router = express.Router();

// Render search results page
router.get('/search', (req, res) => {
    const query = req.query.q || '';
    res.render('searchResults', { query });
});

router.get('/api/search', searchAll);
