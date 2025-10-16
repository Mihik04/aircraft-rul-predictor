# Use a full Python image with apt-get available
FROM python:3.10-slim

# Install git and git-lfs for large model support
RUN apt-get update && apt-get install -y git git-lfs && git lfs install

# Set working directory inside the container
WORKDIR /app

# Copy everything into the container
COPY . .

# Pull large files tracked by Git LFS (like .joblib models)
RUN git lfs pull

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the backend port
EXPOSE 5000

# Run FastAPI server via uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
