# Pinned slim base — matches the app's Python version, small image.
FROM python:3.11.9-slim

# PYTHONDONTWRITEBYTECODE: don't litter .pyc files in the container.
# PYTHONUNBUFFERED: stream logs straight to stdout/stderr (so `kubectl logs` is live).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements FIRST and install — this layer is cached and only rebuilds
# when requirements.txt changes, so code edits don't trigger a full reinstall.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Then copy the application code (changes often -> kept in its own later layer).
COPY . .

# Documents the port the server listens on inside the container.
EXPOSE 8000

# --host 0.0.0.0 is REQUIRED: the default 127.0.0.1 is only reachable from
# inside the container. No --reload in a container image.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
