const app = require('./api/index');

// This file is for local development only.
// Vercel will use api/index.js directly.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 