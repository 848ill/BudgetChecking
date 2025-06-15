const express = require('express');
const { createClient } = require('@vercel/kv');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

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

// Serve the frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// For local development, we can listen on port 3000.
// Vercel will ignore this when deploying.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app; 