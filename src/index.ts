import { InPlayGuruScraper } from './scraper/InPlayGuruScraper';
import logger from './utils/logger';


async function main() {
  const scraper = new InPlayGuruScraper();

  try {
    // Start the HTTP server
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