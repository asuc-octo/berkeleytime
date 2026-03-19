FROM python:3.11.12-slim AS builder-py

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.lock .

RUN pip install uv
RUN --mount=type=cache,target=/root/.cache/uv \
    uv venv /app/.venv && uv pip install --python /app/.venv \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.lock

FROM python:3.11.12-slim AS semantic-search-prod

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY --from=builder-py /app/.venv /app/.venv

COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
