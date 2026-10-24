#!/bin/bash

# Load NVM & Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"

echo "=================================================="
echo "🚀 ĐANG KHỞI ĐỘNG HỆ THỐNG HUMAN RESOURCES AI PLATFORM"
echo "=================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Bật Docker (PostgreSQL, pgAdmin, n8n)
echo -e "\n[1/3] Khởi động Docker Containers..."
cd "$SCRIPT_DIR"
docker compose up -d

# 2. Bật Backend NestJS
echo -e "\n[2/3] Khởi động Backend NestJS (Port 3001)..."
cd "$SCRIPT_DIR/backend"
pkill -f "node dist/main.js" 2>/dev/null || true
nohup node dist/main.js > "$SCRIPT_DIR/backend.log" 2>&1 &
disown
echo "-> Backend khởi động tại http://localhost:3001"

# 3. Bật Frontend Next.js
echo -e "\n[3/3] Khởi động Frontend Next.js (Port 3000)..."
cd "$SCRIPT_DIR/frontend"
pkill -f "next-server" 2>/dev/null || true
nohup npm run start -- -p 3000 > "$SCRIPT_DIR/frontend.log" 2>&1 &
disown
echo "-> Frontend khởi động tại http://localhost:3000"

# Chờ 3s để các tiến trình ổn định
sleep 3

echo -e "\n=================================================="
echo "🎉 TẤT CẢ DỊCH VỤ ĐÃ SẴN SÀNG:"
echo "👉 1. Giao diện người dùng (Frontend):  http://localhost:3000"
echo "👉 2. Backend API (NestJS):             http://localhost:3001"
echo "👉 3. n8n Automation Engine:           http://localhost:5679"
echo "👉 4. pgAdmin Quản trị Database:        http://localhost:5050"
echo "=================================================="
