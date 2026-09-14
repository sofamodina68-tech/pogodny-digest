export async function fetchForecast({ latitude, longitude }, { forecastBaseUrl, timeoutMs, days }) {
  const url = new URL(forecastBaseUrl);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('forecast_days', String(days));
  url.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Таймаут запроса прогноза');
    throw new Error('Сеть недоступна при запросе прогноза');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Ошибка прогноза (${response.status})`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Некорректный JSON в ответе прогноза');
  }

  return data.daily;
}