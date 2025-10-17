# Use official slim Python image
FROM python:3.10-slim

# Install system dependencies (lightgbm + git-lfs)
RUN apt-get update && \
    apt-get install -y git git-lfs libgomp1 && \
    git lfs install && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files only (cleaner, faster)
COPY backend ./backend
COPY requirements.txt .
COPY runtime.txt .
COPY Dockerfile .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port for FastAPI
EXPOSE 5000

# Run FastAPI backend from correct directory
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
