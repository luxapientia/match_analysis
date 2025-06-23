import { InPlayGuruScraper } from './scraper/InPlayGuruScraper';
import logger from './utils/logger';

const email = process.env.EMAIL || '';
const password = process.env.PASSWORD || '';

console.log(email, password);

async function main() {
  const scraper = new InPlayGuruScraper();

  try {
    // Start the HTTP server
    // Initialize and run the scraper
    await scraper.initialize("Profile 1");
    await scraper.scrapeMatchData();
    await scraper.scrapeScheduleData();
    
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