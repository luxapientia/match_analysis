import { InPlayGuruScraper } from './scraper/InPlayGuruScraper';
import logger from './utils/logger';

const email = process.env.EMAIL || '';
const password = process.env.PASSWORD || '';

console.log(email, password);

async function main() {
  const matchScraper = new InPlayGuruScraper();
  const scheduleScraper = new InPlayGuruScraper();

  try {
    // Start the HTTP server
    // Initialize and run the scraper
    await scheduleScraper.initialize("schedule");
    await scheduleScraper.scrapeScheduleData();
    await matchScraper.initialize("match");
    await matchScraper.scrapeMatchData();
    
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