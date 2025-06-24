import { InPlayGuruScraper } from './scraper/InPlayGuruScraper';
import logger from './utils/logger';

const email = process.env.EMAIL || '';
const password = process.env.PASSWORD || '';

console.log(email, password);

async function main() {
  const scraper = new InPlayGuruScraper();

    // Start the HTTP server
    // Initialize and run the scraper
    await scraper.initialize("Profile 1");
    await scraper.scrapeMatchData();
    await scraper.scrapeScheduleData();
}

main();