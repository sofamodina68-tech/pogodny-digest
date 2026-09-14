/**
 * Бизнес-логика «Погодного дайджеста»:
 *  - параллельная обработка списка городов;
 *  - кэш отчётов за текущую дату;
 *  - изоляция ошибок: сбой одного города не прерывает остальные.
 */

import { fetchCoordinates } from '../api/geocodingClient.js';
import { fetchForecast } from '../api/forecastClient.js';
import { readCachedReport, saveReport } from '../storage/reportStorage.js';

/**
 * Обрабатывает один город: кэш → геокодинг → прогноз → сохранение.
 *
 * @param {string} city
 * @param {object} options
 * @param {string} options.geocodingBaseUrl
 * @param {string} options.forecastBaseUrl
 * @param {number} options.timeoutMs
 * @param {string} options.reportsDir
 * @param {number} options.days
 * @param {boolean} options.noCache
 * @returns {Promise<object>} отчёт по городу
 */
export async function processCity(city, options) {
  const {
    geocodingBaseUrl,
    forecastBaseUrl,
    timeoutMs,
    reportsDir,
    days,
    noCache,
  } = options;

  // 1. Кэш
  if (!noCache) {
    const cached = await readCachedReport(city, { reportsDir });
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  // 2. Геокодинг
  const location = await fetchCoordinates(city, {
    baseUrl: geocodingBaseUrl,
    timeoutMs,
  });

  // 3. Прогноз
  const daily = await fetchForecast(
    { latitude: location.latitude, longitude: location.longitude },
    { forecastBaseUrl, timeoutMs, days }
  );

  // 4. Преобразуем ответ API в удобный отчёт
  const report = {
    city: location.name,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    days: (daily.time || []).map((date, i) => ({
      date,
      tempMin: daily.temperature_2m_min?.[i] ?? null,
      tempMax: daily.temperature_2m_max?.[i] ?? null,
      precipitation: daily.precipitation_sum?.[i] ?? null,
    })),
    cached: false,
  };

  // 5. Сохраняем в файл (для последующего кэширования)
  await saveReport(city, report, { reportsDir });

  return report;
}

/**
 * Обрабатывает список городов параллельно.
 * Ошибка одного города не прерывает остальные.
 *
 * @returns {Promise<{ reports: object[], errors: Array<{city: string, message: string}> }>}
 */
export async function processCities(cities, options) {
  const results = await Promise.allSettled(
    cities.map((city) => processCity(city, options))
  );

  const reports = [];
  const errors = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      reports.push(result.value);
    } else {
      errors.push({
        city: cities[index],
        message: result.reason?.message || String(result.reason),
      });
    }
  });

  return { reports, errors };
}