# InPlayGuru Scraper

A professional web scraper for InPlayGuru using Puppeteer and TypeScript.

## Features

- Automated web scraping of InPlayGuru website
- TypeScript for type safety and better developer experience
- Configurable through environment variables
- Comprehensive logging system
- Error handling and recovery
- Clean and maintainable code structure

## Project Structure

```
inplay-scraper/
├── src/
│   ├── config/
│   │   └── config.ts
│   ├── scraper/
│   │   └── InPlayGuruScraper.ts
│   ├── utils/
│   │   └── logger.ts
│   └── index.ts
├── dist/
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd inplay-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

## Usage

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Configuration

The following environment variables can be configured in `.env`:

- `TARGET_URL`: The target URL to scrape (default: https://inplayguru.com/)
- `HEADLESS`: Run browser in headless mode (default: true)
- `TIMEOUT`: Page load timeout in milliseconds (default: 30000)
- `LOG_LEVEL`: Logging level (default: info)

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 