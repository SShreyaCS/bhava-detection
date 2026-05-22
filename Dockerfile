FROM python:3.11.9-slim-bookworm

WORKDIR /app

# OpenCV headless dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .python-version ./
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

COPY app.py render.yaml ./
COPY model/ ./model/

ENV PORT=10000
EXPOSE 10000

CMD uvicorn app:app --host 0.0.0.0 --port ${PORT}
