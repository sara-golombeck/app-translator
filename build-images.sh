#!/bin/bash

# Build Docker images for Kubernetes deployment

echo "Building Docker images..."

# Build backend image
echo "Building backend image..."
docker build -t app-translator-backend:latest ./backend

# Build frontend image  
echo "Building frontend image..."
docker build -t app-translator-frontend:latest ./frontend

echo "Docker images built successfully!"

# Optional: Tag for registry
# docker tag app-translator-backend:latest your-registry/app-translator-backend:latest
# docker tag app-translator-frontend:latest your-registry/app-translator-frontend:latest

echo "To push to registry, run:"
echo "docker push your-registry/app-translator-backend:latest"
echo "docker push your-registry/app-translator-frontend:latest"