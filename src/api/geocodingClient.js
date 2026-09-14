export async function fetchCoordinates(city, { baseUrl, timeoutMs }) {
  const url = new URL(baseUrl);
  url.searchParams.set('name', city);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'ru');
  url.searchParams.set('format', 'json');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Таймаут запроса геокодинга для "${city}"`);
    }
    throw new Error(`Сеть недоступна при запросе геокодинга для "${city}"`);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(`Ошибка геокодинга (${response.status}) для "${city}"`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Некорректный JSON в ответе геокодинга для "${city}"`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error(`Город "${city}" не найден`);
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}