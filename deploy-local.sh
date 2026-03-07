#!/bin/bash
set -e

echo "Starting website-node locally..."
docker compose up --build -d
echo "Live at http://localhost:3000"
