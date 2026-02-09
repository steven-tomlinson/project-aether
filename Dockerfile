# Build Stage for React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime Stage for Python
FROM python:3.10-slim
WORKDIR /app

# Install System Dependencies
RUN apt-get update && apt-get install -y gcc libffi-dev && rm -rf /var/lib/apt/lists/*

# Install Python Dependencies from Backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend /app/backend

# Copy React Build from Build Stage
COPY --from=build /app/dist /app/static

# Expose Port
ENV PORT=8080
EXPOSE 8080

# Run Uvicorn with dynamic port for Cloud Run
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
