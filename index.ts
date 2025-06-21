import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 80;

// Enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname, 'output')));

async function main() {

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

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 