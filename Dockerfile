# ── Backend ───────────────────────────────────────────────────────────────────
FROM python:3.11-slim AS backend

WORKDIR /app
COPY app/backend/requirements.txt .
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

COPY app/backend/ .
RUN mkdir -p uploads exports

EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
