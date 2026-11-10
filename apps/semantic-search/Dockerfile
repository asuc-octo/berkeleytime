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

ARG SEMANTIC_SEARCH_MODEL=sentence-transformers/all-MiniLM-L6-v2
ARG SEMANTIC_SEARCH_MODEL_REVISION=1110a243fdf4706b3f48f1d95db1a4f5529b4d41

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    SEMANTIC_SEARCH_MODEL=$SEMANTIC_SEARCH_MODEL \
    SEMANTIC_SEARCH_MODEL_REVISION=$SEMANTIC_SEARCH_MODEL_REVISION

WORKDIR /app

COPY --from=builder-py /app/.venv /app/.venv

# Pre-download the embedding model so it's baked into the image.
# This avoids runtime download races and filelock deadlocks on container startup.
RUN /app/.venv/bin/python -c \
    "import os; from sentence_transformers import SentenceTransformer; SentenceTransformer(os.environ['SEMANTIC_SEARCH_MODEL'], revision=os.environ['SEMANTIC_SEARCH_MODEL_REVISION'])"

# Production must use the model baked above rather than downloading a different
# revision into a writable cache during startup.
ENV HF_HUB_OFFLINE=1 \
    TRANSFORMERS_OFFLINE=1

COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
