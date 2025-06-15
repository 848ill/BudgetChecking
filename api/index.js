const express = require('express');
const { createClient } = require('@vercel/kv');
const app = express();
const path = require('path');

// Middleware to handle JSON payloads
app.use(express.json());

// For local development, serve static files from the public directory
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Initialize Vercel KV client
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const budgetComponents = [
    'Makan', 'Minum', 'Nongkrong', 'Bensin', 'Token Listrik',
    'Subscription (Netflix, dll.)', 'Alat WC', 'Alat Mandi', 'Peralatan Kos',
    'Paket Data', 'Laundry', 'Nabung', 'Dana Darurat', 'Keperluan Kuliah'
];

const defaultData = {
    pemasukan: 0,
    items: {}
};

// GET endpoint to retrieve current budget data
app.get('/api/budget', async (req, res) => {
    try {
        let savedData = await kv.get('budget-data');
        if (!savedData) {
            savedData = defaultData;
        }
        res.json({
            components: budgetComponents,
            savedData: savedData
        });
    } catch (error) {
        console.error('Error fetching data from KV:', error);
        // If KV is not configured, send default data
        res.json({
            components: budgetComponents,
            savedData: defaultData
        });
    }
});

// POST endpoint to save budget data
app.post('/api/budget', async (req, res) => {
    const { pemasukan, items } = req.body;

    if (pemasukan === undefined || !items) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    try {
        await kv.set('budget-data', { pemasukan, items });
        res.status(200).json({ message: 'Budget saved successfully.' });
    } catch (error) {
        console.error('Error saving data to KV:', error);
        res.status(500).json({ message: 'Error saving data. Make sure Vercel KV is configured.' });
    }
});

// For local dev, this will catch any other request and serve the frontend.
// In production, Vercel's routing will handle this.
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

module.exports = app; 