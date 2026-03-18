FROM python:3.11-slim AS semantic-search-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install uv
RUN uv pip install --system -r requirements.txt


COPY app ./app

FROM semantic-search-base AS semantic-search-prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
