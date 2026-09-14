/**
 * Форматирование и вывод отчёта в консоль.
 */

const PAD = 2;

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return Number(value).toFixed(digits);
}

/**
 * Печатает один отчёт по городу.
 */
export function printReport(report) {
  const { city, country, latitude, longitude, days, cached } = report;

  const header = `🌤  ${city}, ${country}`;
  console.log('\n' + header);
  console.log('─'.repeat(header.length));

  console.log(`Координаты: ${formatNumber(latitude, 4)}, ${formatNumber(longitude, 4)}`);
  if (cached) {
    console.log('Источник: кэш (файл отчёта за сегодня)');
  } else {
    console.log('Источник: Open-Meteo API');
  }

  console.log('');
  console.log(
    'Дата'.padEnd(12) +
    'Мин, °C'.padStart(10) +
    'Макс, °C'.padStart(11) +
    'Осадки, мм'.padStart(13)
  );
  console.log('─'.repeat(46));

  for (const day of days) {
    console.log(
      String(day.date).padEnd(12) +
      formatNumber(day.tempMin, 1).padStart(10) +
      formatNumber(day.tempMax, 1).padStart(11) +
      formatNumber(day.precipitation, 1).padStart(13)
    );
  }
}

/**
 * Печатает сообщение об ошибке для одного города (без стек-трейса).
 */
export function printCityError(city, message) {
  console.error(`✖ ${city}: ${message}`);
}

/**
 * Печатает общее сообщение об ошибке.
 */
export function printError(message) {
  console.error(`✖ ${message}`);
}