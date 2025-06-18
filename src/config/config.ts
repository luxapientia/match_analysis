import dotenv from 'dotenv';

dotenv.config();

export const config = {
  targetUrl: process.env.TARGET_URL || 'https://inplayguru.com/inplay',
  scraping: {
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
}; 