#!/bin/bash
echo "🛑 Đang tắt toàn bộ hệ thống Human Resources..."

# Tắt Backend và Frontend
pkill -f "node dist/main.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Tắt Docker containers
cd /home/tuss/human-resources
docker compose down

echo " Đã tắt toàn bộ dịch vụ an toàn!"
