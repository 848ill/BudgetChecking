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

const BUDGET_KEYS_LIST = 'budget-keys';

const budgetComponents = [
    'Makan', 'Minum', 'Nongkrong', 'Bensin', 'Token Listrik',
    'Subscription (Netflix, dll.)', 'Alat WC', 'Alat Mandi', 'Peralatan Kos',
    'Paket Data', 'Laundry', 'Nabung', 'Dana Darurat', 'Keperluan Kuliah'
];

const defaultData = {
    pemasukan: 0,
    items: {}
};

// GET endpoint to retrieve the list of all saved budget keys
app.get('/api/budgets', async (req, res) => {
    try {
        const keys = await kv.lrange(BUDGET_KEYS_LIST, 0, -1);
        res.json(keys || []);
    } catch (error) {
        console.error('Error fetching budget list from KV:', error);
        res.status(500).json({ message: 'Error fetching budget list' });
    }
});

// GET endpoint to retrieve a specific budget by its key (e.g., budget-2023-11)
app.get('/api/budget/:key', async (req, res) => {
    try {
        const { key } = req.params;
        let savedData = await kv.get(key);
        if (!savedData) {
            savedData = defaultData;
        }
        res.json({
            components: budgetComponents,
            savedData: savedData,
            isNew: !savedData // Let frontend know if it's a new budget for the month
        });
    } catch (error) {
        console.error('Error fetching data from KV:', error);
        res.status(500).json({ message: 'Error fetching budget data' });
    }
});

// POST endpoint to save or update budget data for a given month
app.post('/api/budget', async (req, res) => {
    const { pemasukan, items, key } = req.body;

    if (pemasukan === undefined || !items || !key) {
        return res.status(400).json({ message: 'Invalid data format. Requires pemasukan, items, and key.' });
    }

    try {
        // Save the budget data
        await kv.set(key, { pemasukan, items });

        // Add the key to our list of budgets if it's not already there
        await kv.lrem(BUDGET_KEYS_LIST, 0, key); // Remove to avoid duplicates
        await kv.lpush(BUDGET_KEYS_LIST, key);   // Add to the front

        res.status(200).json({ message: `Budget for ${key} saved successfully.` });
    } catch (error) {
        console.error('Error saving data to KV:', error);
        res.status(500).json({ message: 'Error saving data. Make sure Vercel KV is configured.' });
    }
});

// DELETE endpoint to remove a budget
app.delete('/api/budget/:key', async (req, res) => {
    const { key } = req.params;
    if (!key) {
        return res.status(400).json({ message: 'Budget key is required.' });
    }

    try {
        // Delete the budget data
        await kv.del(key);
        // Remove the key from our list of budgets
        await kv.lrem(BUDGET_KEYS_LIST, 0, key);
        res.status(200).json({ message: `Budget ${key} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting data from KV:', error);
        res.status(500).json({ message: 'Error deleting budget.' });
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