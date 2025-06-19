import { InPlayGuruScraper } from './scraper/InPlayGuruScraper';
import logger from './utils/logger';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

app.use(express.static(path.join(__dirname, '../output')));

async function main() {
  const scraper = new InPlayGuruScraper();

  try {
    // Start the HTTP server
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Initialize and run the scraper
    await scraper.initialize();
    await scraper.scrapeMatchData();
  } catch (error) {
    logger.error('Application error:', error);
  } finally {
    // await scraper.close();
  }
}

main().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
}); 