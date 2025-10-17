# Use Python base image
FROM python:3.10-slim

# Install system dependencies
# libgomp1 is needed for LightGBM
RUN apt-get update && \
    apt-get install -y git git-lfs libgomp1 && \
    git lfs install && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose port for backend
EXPOSE 5000

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
