# Use a full Python image
FROM python:3.10-slim

# Install git and git-lfs (for large model support)
RUN apt-get update && apt-get install -y git git-lfs && git lfs install

# Set working directory
WORKDIR /app

# Copy everything from root into the container
COPY . .

# ✅ We remove "git lfs pull" since .git folder isn't copied into Docker
# The models will already be present in your repo (via Git LFS pointer files)

# Install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose backend port
EXPOSE 5000

# Start FastAPI via Uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "5000"]
