FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create directories
RUN mkdir -p data/vector_db logs

# Expose port
EXPOSE 8000

# Run server
CMD ["python", "run.py"]
