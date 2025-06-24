import forever from 'forever';
import path from 'path';
import logger from './utils/logger';

const scriptPath = path.join(process.cwd(), 'dist', 'index.js');

logger.info('Starting application with Forever...');

forever.start(scriptPath, {
  max: 3,               // Maximum number of times to restart the script
  silent: false,        // Don't suppress output
  killTree: true,       // Kill all child processes if parent dies
  minUptime: 2000,      // Minimum time (ms) the app needs to stay up to be considered running
  spinSleepTime: 1000,  // Time to wait between restarts
  logFile: path.join(process.cwd(), 'forever.log'),
  outFile: path.join(process.cwd(), 'output.log'),
  errFile: path.join(process.cwd(), 'error.log')
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal. Stopping Forever...');
  forever.stopAll().then(() => {
    logger.info('All processes stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT signal. Stopping Forever...');
  forever.stopAll().then(() => {
    logger.info('All processes stopped');
    process.exit(0);
  });
});