#!/usr/bin/env node
/**
 * CLI «Погодный дайджест».
 *
 * Запуск:
 *   node --env-file=.env src/index.js --city "Москва" --days 3
 *   node --env-file=.env src/index.js --city "Москва,Нижний Новгород" --days 5
 *   node --env-file=.env src/index.js --city "Москва" --no-cache
 */

import { processCities } from './services/weatherService.js';
import { printReport, printCityError, printError } from './format/consoleFormatter.js';

const DEFAULT_DAYS = 3;
const MIN_DAYS = 1;
const MAX_DAYS = 7;
const DEFAULT_TIMEOUT_MS = 5000;

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    city: null,
    days: DEFAULT_DAYS,
    noCache: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--city') {
      options.city = args[++i];
    } else if (arg === '--days') {
      options.days = Number(args[++i]);
    } else if (arg === '--no-cache') {
      options.noCache = true;
    } else {
      throw new Error(`Неизвестный аргумент: ${arg}`);
    }
  }

  if (!options.city) {
    throw new Error('Параметр --city обязателен. Пример: --city "Москва"');
  }

  if (!Number.isInteger(options.days) || options.days < MIN_DAYS || options.days > MAX_DAYS) {
    throw new Error(`Параметр --days должен быть целым числом от ${MIN_DAYS} до ${MAX_DAYS}`);
  }

  return options;
}

async function main() {
  let cli;
  try {
    cli = parseArgs(process.argv);
  } catch (err) {
    printError(err.message);
    process.exit(1);
  }

  const cities = cli.city
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  if (cities.length === 0) {
    printError('Не указан ни один город.');
    process.exit(1);
  }

  const options = {
    geocodingBaseUrl:
      process.env.GEOCODING_BASE_URL ||
      'https://geocoding-api.open-meteo.com/v1/search',
    forecastBaseUrl:
      process.env.FORECAST_BASE_URL ||
      'https://api.open-meteo.com/v1/forecast',
    timeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    reportsDir: process.env.REPORTS_DIR || 'reports',
    days: cli.days,
    noCache: cli.noCache,
  };

  const { reports, errors } = await processCities(cities, options);

  for (const report of reports) {
    printReport(report);
  }

  for (const err of errors) {
    printCityError(err.city, err.message);
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  printError(err.message || String(err));
  process.exit(1);
});