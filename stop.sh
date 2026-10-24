#!/bin/bash
echo "🛑 Đang tắt toàn bộ hệ thống Human Resources..."

# Tắt Backend và Frontend
pkill -f "node dist/main.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Tắt Docker containers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
docker compose down

echo " Đã tắt toàn bộ dịch vụ an toàn!"
