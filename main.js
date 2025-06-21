const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 80;

// Enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname, 'output')));

exports.main = async function main() {

  try {
    // Start the HTTP server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Initialize and run the scraper
  } catch (error) {
    console.error('Application error:', error);
  } finally {
    // await scraper.close();
  }
}