# Use official slim Python image
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y git git-lfs libgomp1 && \
    git lfs install && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend folder (including requirements + models)
COPY backend ./backend
COPY runtime.txt .

# Install dependencies from inside backend/
RUN pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Expose FastAPI port
EXPOSE 5000

# Run from correct directory
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
