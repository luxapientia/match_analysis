/// <reference lib="dom" />
import puppeteer, { Browser, Page } from 'puppeteer';
import { config } from '../config/config';
import logger from '../utils/logger';
import { MatchData } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import zlib from 'zlib';

export class InPlayGuruScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly outputPath = path.join(process.cwd(), 'output', 'analysis.json');
  private readonly tempOutputPath = path.join(process.cwd(), 'output', 'analysis.json.tmp');
  private readonly outputPathGz = path.join(process.cwd(), 'output', 'analysis.gz');
  private readonly tempOutputPathGz = path.join(process.cwd(), 'output', 'analysis.gz.tmp');
  private matchData: MatchData = {};
  private loginCheckInterval: NodeJS.Timeout | null = null;
  private isWriting: boolean = false;

  private async saveMatchData(): Promise<void> {
    try {
      if (this.isWriting) return;
      this.isWriting = true;
      // Ensure output directory exists
      const outputDir = path.dirname(this.outputPath);
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Write to temporary file first
      await fs.promises.writeFile(
        this.tempOutputPath,
        JSON.stringify(this.matchData, null, 2),
        'utf-8'
      );

      // Compress JSON and write to temp .gz file
      const gzippedBuffer = await new Promise<Buffer>((resolve, reject) => {
        zlib.gzip(JSON.stringify(this.matchData, null, 2), (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Write compressed buffer to temp .gz file
      await fs.promises.writeFile(this.tempOutputPathGz, gzippedBuffer);

      // // Safely remove the existing file if it exists
      // try {
      //   await fs.promises.access(this.outputPath);
      //   await fs.promises.unlink(this.outputPath);
      // } catch (err) {
      //   // File doesn't exist; that's okay
      // }

      // try {
      //   await fs.promises.access(this.outputPathGz);
      //   await fs.promises.unlink(this.outputPathGz);
      // } catch (err) {
      //   // File doesn't exist; that's okay
      // }

      // Rename temp file to actual file
      await fs.promises.rename(this.tempOutputPath, this.outputPath);
      await fs.promises.rename(this.tempOutputPathGz, this.outputPathGz);

      logger.info('Match data saved to analysis.json');
    } catch (error) {
      // logger.error('Failed to save match data:', error);
    } finally {
      this.isWriting = false;
    }
  }

  private async updateMatchData(wsData: any): Promise<void> {
    try {
      if (!wsData || !wsData.id) return;

      // If this match exists in our data, update it
      if (this.matchData[wsData.id]) {
        if (wsData.diff_stats) {
          const diff_stats = wsData.diff_stats;
          delete wsData.diff_stats;
          wsData.stats = diff_stats;
        }
        if (wsData.diff_stats_trend) {
          const diff_stats_trend = wsData.diff_stats_trend;
          delete wsData.diff_stats_trend;
          wsData.stats_trend = diff_stats_trend;
        }

        for (const key in wsData) {
          if (typeof wsData[key] === 'object') {
            (this.matchData[wsData.id] as any)[key] = {
              ...(this.matchData[wsData.id] as any)[key],
              ...wsData[key]
            }
          } else {
            (this.matchData[wsData.id] as any)[key] = wsData[key];
          }
        }
        logger.info(`Updated match data for ID: ${wsData.id}`);
      } else {
        this.matchData[wsData.id] = wsData;
        logger.info(`Updated match data for ID: ${wsData.id}`);
      }
    } catch (error) {
      logger.error('Failed to update match data:', error);
    }
  }

  private async deleteMatchData(matchId: string): Promise<void> {
    try {
      delete this.matchData[matchId];
      logger.info(`Match ended: ${matchId}`);
    } catch (error) {
      logger.error('Failed to delete match data:', error);
    }
  }

  private async processWebSocketData(data: string): Promise<void> {
    let commandStartPosition = data.indexOf('"');
    let commandEndPosition = data.indexOf('"', commandStartPosition + 1);
    let command = data.substring(commandStartPosition + 1, commandEndPosition);
    console.log("++++++++++++++++++++++", command, '+++++++++++')
    if (command === 'match_ended') {
      let matchIdStartPosition = data.indexOf('"', commandEndPosition + 1);
      let matchIdEndPosition = data.indexOf('"', matchIdStartPosition + 1);
      let matchId = data.substring(matchIdStartPosition + 1, matchIdEndPosition);
      await this.deleteMatchData(matchId);
    } else {
      const startPosition = data.indexOf('{');
      const endPosition = data.lastIndexOf('}');
      const jsonSocketData = JSON.parse(data.substring(startPosition, endPosition + 1));
      await this.updateMatchData(jsonSocketData);
    }
    await this.saveMatchData();
    return;
  }

  async initialize(profile: string = 'Profile 1'): Promise<void> {
    console.log('Initializing browser with profile:', profile);
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--start-maximized',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          `--profile-directory=${profile}`,
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-extensions',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--enable-automation',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--no-first-run',
          '--password-store=basic'
        ],
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        ignoreHTTPSErrors: true
      });

      this.page = await this.browser.newPage();

      // Set longer timeout for navigation
      await this.page.setDefaultNavigationTimeout(120000);

      // Maximize window
      const session = await this.page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', {
        windowId,
        bounds: { windowState: 'maximized' }
      });

      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

      // Set timezone
      await this.page.emulateTimezone('America/New_York');

      // Inject anti-detection scripts
      await this.page.evaluateOnNewDocument(() => {
        // Hide webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // Add language preferences
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

        // Add fake plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => ({
            length: 5,
            item: () => ({
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              name: "Chrome PDF Plugin"
            })
          })
        });

        // Add Chrome specific properties
        Object.defineProperty(window, 'chrome', {
          get: () => ({
            runtime: {},
            app: {},
            loadTimes: () => { },
            csi: () => { }
          })
        });

        // Mock permissions API
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any): Promise<any> =>
          parameters.name === 'notifications'
            ? Promise.resolve({
              state: 'granted',
              name: parameters.name,
              onchange: null,
              addEventListener: () => { },
              removeEventListener: () => { },
              dispatchEvent: () => true
            })
            : originalQuery(parameters);

        // Add WebGL support
        Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });

        // Mock canvas fingerprinting
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          contextId: '2d' | 'bitmaprenderer' | 'webgl' | 'webgl2',
          options?: CanvasRenderingContext2DSettings | ImageBitmapRenderingContextSettings | WebGLContextAttributes
        ) {
          const context = getContext.call(this, contextId, options);
          if (context && contextId === '2d') {
            const getImageData = (context as CanvasRenderingContext2D).getImageData;
            (context as CanvasRenderingContext2D).getImageData = function (...args: Parameters<typeof getImageData>) {
              return getImageData.apply(this, args);
            };
          }
          return context;
        } as typeof HTMLCanvasElement.prototype.getContext;

        // Mock audio fingerprinting
        const audioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (audioContext) {
          const origCreateOscillator = audioContext.prototype.createOscillator;
          audioContext.prototype.createOscillator = function () {
            const oscillator = origCreateOscillator.call(this);
            oscillator.start = () => { };
            return oscillator;
          };
        }

        // Add more browser features
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
        Object.defineProperty(navigator, 'connection', {
          get: () => ({
            effectiveType: '4g',
            rtt: 50,
            downlink: 10,
            saveData: false
          })
        });

        // Mock battery API
        Object.defineProperty(navigator, 'getBattery', {
          get: () => () => Promise.resolve({
            charging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
            level: 1,
            addEventListener: () => { },
            removeEventListener: () => { },
            dispatchEvent: () => true
          })
        });
      });

      // Set common headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      // Enable JavaScript and cookies
      await this.page.setJavaScriptEnabled(true);
      await this.page.setCacheEnabled(true);

      // Add styles for proper window filling
      await this.page.evaluate(() => {
        const style = document.createElement('style');
        style.textContent = `
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          #root, .app-container {
            width: 100% !important;
            height: 100% !important;
            min-height: 100vh !important;
          }
        `;
        document.head.appendChild(style);
      });

      await this.page.goto(config.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Expose the processWebSocketData function to the browser
      await this.page.exposeFunction('sendWebSocketDataToBackend',
        (data: string) => this.processWebSocketData(data)
      );

      logger.info('Browser initialized with anti-detection measures');
    } catch (error) {
      logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async scrapeMatchData(): Promise<void> {
    try {
      if (!this.page) throw new Error('Browser not initialized');

      await this.login(config.email, config.password);

      this.page.on('response', async (response: any) => {
        const url = response.url();
        if (url.includes("inplayguru.com/matches")) {
          const rawData = await response.text();
          const matchData = JSON.parse(rawData) as MatchData;
          // Store the initial match data
          this.matchData = matchData;
          for (const matchId in this.matchData) {
            this.matchData[matchId].stats = {
              attacks: [matchData[matchId].stats.attacks?.[0], matchData[matchId].stats.attacks?.[1]],
              dangerous_attacks: [matchData[matchId].stats.dangerous_attacks?.[0], matchData[matchId].stats.dangerous_attacks?.[1]],
              off_target: [matchData[matchId].stats.off_target?.[0], matchData[matchId].stats.off_target?.[1]],
              on_target: [matchData[matchId].stats.on_target?.[0], matchData[matchId].stats.on_target?.[1]],
              corners: [matchData[matchId].stats.corners?.[0], matchData[matchId].stats.corners?.[1]],
              goals: [matchData[matchId].stats.goals?.[0], matchData[matchId].stats.goals?.[1]],
              penalties: [matchData[matchId].stats.penalties?.[0], matchData[matchId].stats.penalties?.[1]],
              redcards: [matchData[matchId].stats.redcards?.[0], matchData[matchId].stats.redcards?.[1]],
              yellowcards: [matchData[matchId].stats.yellowcards?.[0], matchData[matchId].stats.yellowcards?.[1]],
              possession: [matchData[matchId].stats.possession?.[0], matchData[matchId].stats.possession?.[1]],
              momentum: [matchData[matchId].stats.momentum?.[0], matchData[matchId].stats.momentum?.[1]],
              xg: [matchData[matchId].stats.xg?.[0] || null, matchData[matchId].stats.xg?.[1] || null],
            }

            this.matchData[matchId].stats_trend = {
              attacks: matchData[matchId].stats_trend.attacks,
              dangerous_attacks: matchData[matchId].stats_trend.dangerous_attacks,
              off_target: matchData[matchId].stats_trend.off_target,
              on_target: matchData[matchId].stats_trend.on_target,
              corners: matchData[matchId].stats_trend.corners,
              goals: matchData[matchId].stats_trend.goals,
              penalties: matchData[matchId].stats_trend.penalties,
              redcards: matchData[matchId].stats_trend.redcards,
              yellowcards: matchData[matchId].stats_trend.yellowcards,
              possession: matchData[matchId].stats_trend.possession,
              momentum: matchData[matchId].stats_trend.momentum,
              xg: matchData[matchId].stats_trend.xg || {},
            }
            // const match = matchData[matchId];
            // if(!match.stats.xg) {
            //   match.stats.xg = [null, null];
            // }
            // if(!match.stats_trend.xg) {
            //   match.stats_trend.xg = {};
            // }
          }

          await this.saveMatchData();
        }
      });

      await this.page.evaluateOnNewDocument(() => {
        const originalSend = WebSocket.prototype.send;
        let hookedOnmessage: any;
        WebSocket.prototype.send = function (data: any) {
          if (this.onmessage != hookedOnmessage) {
            let originalOnmessage: any = this.onmessage;
            let _self = this;
            this.onmessage = function (event: any) {
              originalOnmessage.call(_self, event);
              (window as any).sendWebSocketDataToBackend(event.data);
            }
            hookedOnmessage = this.onmessage;
          }
          return originalSend.call(this, data);
        };
      });

      await this.page.goto(config.inPlayUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 300000
      });

      // Start periodic login check after page load

    } catch (error) {
      logger.error('Failed to scrape match data:', error);
      throw error;
    }
  }

  async scrapeScheduleData(): Promise<void> {
    try {
      if (!this.page) throw new Error('Browser not initialized');
      await this.login(config.email, config.password);

      await this.page.goto(config.scheduleUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 300000
      });

      logger.info('Navigated to schedule page');
      
    } catch (error) {
      logger.error('Failed to scrape schedule data:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      // Clear the login check interval
      if (this.loginCheckInterval) {
        clearInterval(this.loginCheckInterval);
        this.loginCheckInterval = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        logger.info('Browser closed successfully');
      }
    } catch (error) {
      logger.error('Failed to close browser:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      if (!this.page) throw new Error('Browser not initialized');
      
      // Check if login button exists
      try {
        await this.page.waitForSelector('a.nav-link[href="https://inplayguru.com/login"]', { timeout: 3000 });
      } catch (error) {
        logger.info('Login button not found, user might be already logged in');
        return;
      }

      // Click the login button
      await this.page.click('a.nav-link[href="https://inplayguru.com/login"]');
      
      // Wait until URL changes to login page
      await this.page.waitForFunction(
        'window.location.href.includes("/login")',
        { timeout: 5000 }
      );
      
      logger.info('Successfully navigated to login page');

      // Wait for the form elements to be present
      await this.page.waitForSelector('input[name="email"]');
      await this.page.waitForSelector('input[name="password"]');
      await this.page.waitForSelector('button[type="submit"]');

      // Fill in the form
      await this.page.type('input[name="email"]', email);
      await this.page.type('input[name="password"]', password);

      // Submit the form and wait for navigation
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click('button[type="submit"]')
      ]);

      logger.info('Login form submitted successfully');
      
    } catch (error) {
      logger.error('Failed to login:', error);
      throw error;
    }
  }
} 