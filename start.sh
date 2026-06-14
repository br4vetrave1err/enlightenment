#!/bin/bash
set -e

PROJECT_DIR="/home/br4vetrave1er/Desktop/projects/enlightenment"
NGROK_DOMAIN="moonbeam-viability-gratify.ngrok-free.dev"

echo "Starting Enlightenment services..."

# 1. Start Docker containers
cd "$PROJECT_DIR"
/usr/bin/docker compose -f docker/docker-compose.yml up -d
echo "Docker containers started."

# 2. Start Ngrok tunnel
echo "Starting Ngrok tunnel to $NGROK_DOMAIN..."
exec ngrok http 5173 --domain "$NGROK_DOMAIN"
