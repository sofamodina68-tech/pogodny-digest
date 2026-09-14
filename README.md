# Погодный дайджест

Консольная утилита на Node.js, которая по названию города (или списку городов)
получает прогноз погоды через открытый API Open-Meteo, выводит его в консоль
в виде таблицы и сохраняет отчёт в JSON-файл. Поддерживает кэширование:
повторный запрос за тот же день не обращается к сети.

## Требования

- Node.js версии 20 и выше (нужен встроенный `fetch` и флаг `--env-file`)

## Установка

```bash
git clone https://github.com/твой-логин/pogodny-digest.git ////////////////////////////////////////////////////////
cd pogodny-digest
npm install
copy .env.example .env
```

## Переменные окружения

| Переменная | Назначение | Значение по умолчанию |
|---|---|---|
| `GEOCODING_BASE_URL` | адрес API геокодинга | https://geocoding-api.open-meteo.com/v1/search |
| `FORECAST_BASE_URL` | адрес API прогноза | https://api.open-meteo.com/v1/forecast |
| `REQUEST_TIMEOUT_MS` | таймаут запроса, мс | 5000 |
| `REPORTS_DIR` | папка для сохранения отчётов | reports |
| `UNITS` | единицы измерения температуры | celsius |

## Запуск

```bash
node --env-file=.env src/index.js --city "Москва" --days 3
node --env-file=.env src/index.js --city "Москва,Нижний Новгород" --days 5
node --env-file=.env src/index.js --city "Москва" --no-cache
```

- `--city` — обязательный параметр, один город или несколько через запятую
- `--days` — необязательный, от 1 до 7, по умолчанию 3
- `--no-cache` — принудительно обновить данные, игнорируя кэш

## Пример вывода


## Обрабатываемые ошибки

- Отсутствует или некорректен параметр `--city`/`--days` — понятное сообщение, без падения
- Город не найден (пустой результат геокодинга)
- Ответ API со статусом 4xx или 5xx
- Отсутствие сети
- Превышение таймаута запроса
- Некорректный JSON в ответе API

Ошибка по одному городу не прерывает обработку остальных (используется `Promise.allSettled`).

## Коды завершения

- `0` — успех
- `1` — произошла хотя бы одна ошибка

## Структура проекта
src/
index.js — CLI: разбор аргументов, запускsrc/
index.js — CLI: разбор аргументов, запуск
api/
geocodingClient.js — запрос геокодинга
forecastClient.js — запрос прогноза
services/
weatherService.js — бизнес-логика, параллельная обработка городов
storage/
reportStorage.js — сохранение отчётов и работа с кэшем
format/
consoleFormatter.js — вывод в консоль
docs/postman/ — экспортированная Postman-коллекция
api/
geocodingClient.js — запрос геокодинга
forecastClient.js — запрос прогноза
services/
weatherService.js — бизнес-логика, параллельная обработка городов
storage/
reportStorage.js — сохранение отчётов и работа с кэшем
format/
consoleFormatter.js — вывод в консоль
docs/postman/ — экспортированная Postman-коллекция