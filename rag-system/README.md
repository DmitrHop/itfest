# University RAG System 🎓

RAG-система для поиска университетов Казахстана с AI-профориентологом на базе Gemini.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd rag-system
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Настройка API ключа

Отредактируйте `.env`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

Получить ключ: [Google AI Studio](https://aistudio.google.com/app/apikey)

### 3. Инициализация базы данных

```bash
python scripts/init_db.py
```

### 4. Запуск сервера

```bash
python run.py
```

Откройте: http://localhost:8000/docs

## 📡 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/health` | Проверка работоспособности |
| POST | `/query` | Основной RAG-запрос |
| GET | `/filters` | Доступные фильтры |
| POST | `/cache/clear` | Очистка кеша |

### Пример запроса

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Какой IT университет в Алматы с баллом ЕНТ 70?"}'
```

## 🧪 Тестирование

```bash
python scripts/test_queries.py
```

## 🐳 Docker

```bash
docker-compose up -d
```

## 📁 Структура проекта

```
rag-system/
├── src/
│   ├── config/         # Конфигурация
│   ├── models/         # Pydantic схемы
│   ├── services/       # RAG, Vector Store, LLM
│   ├── utils/          # Logger, Data Loader
│   └── main.py         # FastAPI app
├── scripts/            # Скрипты
├── data/               # Векторная БД
├── logs/               # Логи
└── run.py              # Точка входа
```
