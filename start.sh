#!/bin/bash

# Load NVM & Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"

echo "=================================================="
echo "🚀 ĐANG KHỞI ĐỘNG HỆ THỐNG HUMAN RESOURCES AI PLATFORM"
echo "=================================================="

# 1. Bật Docker (PostgreSQL, pgAdmin, n8n)
echo -e "\n[1/3] Khởi động Docker Containers..."
cd /home/tuss/human-resources
docker compose up -d

# 2. Bật Backend NestJS
echo -e "\n[2/3] Khởi động Backend NestJS (Port 3001)..."
cd /home/tuss/human-resources/backend
pkill -f "node dist/main.js" 2>/dev/null || true
nohup node dist/main.js > /home/tuss/human-resources/backend.log 2>&1 &
echo "-> Backend khởi động tại http://localhost:3001"

# 3. Bật Frontend Next.js
echo -e "\n[3/3] Khởi động Frontend Next.js (Port 3000)..."
cd /home/tuss/human-resources/frontend
pkill -f "next-server" 2>/dev/null || true
nohup npm run start -- -p 3000 > /home/tuss/human-resources/frontend.log 2>&1 &
echo "-> Frontend khởi động tại http://localhost:3000"

# Chờ 3s để các tiến trình ổn định
sleep 3

echo -e "\n=================================================="
echo "🎉 TẤT CẢ DỊCH VỤ ĐÃ SẴN SÀNG:"
echo "👉 1. Giao diện người dùng (Frontend):  http://localhost:3000"
echo "👉 2. Backend API (NestJS):             http://localhost:3001"
echo "👉 3. n8n Automation Engine:           http://localhost:5678"
echo "👉 4. pgAdmin Quản trị Database:        http://localhost:5050"
echo "=================================================="
