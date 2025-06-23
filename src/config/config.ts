import dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseUrl: process.env.BASE_URL || 'https://inplayguru.com',
  inPlayUrl: process.env.IN_PLAY_URL || 'https://inplayguru.com/inplay',
  loginUrl: process.env.LOGIN_URL || 'https://inplayguru.com/login',
  scheduleUrl: process.env.SCHEDULE_URL || 'https://inplayguru.com/schedule',
  scraping: {
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  email: process.env.EMAIL || '',
  password: process.env.PASSWORD || '',
}; 