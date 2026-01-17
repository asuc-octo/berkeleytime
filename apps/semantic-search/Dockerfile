FROM python:3.11-slim AS semantic-search-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the ML model during build (avoids slow download at startup)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-base-en-v1.5')"

COPY app ./app

FROM semantic-search-base AS semantic-search-prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
