#!/bin/bash

export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"

echo "=================================================="
echo "🚀 ĐANG KHỞI ĐỘNG HỆ THỐNG HUMAN RESOURCES AI PLATFORM"
echo "=================================================="

# 1. Bật Docker (PostgreSQL, pgAdmin, n8n)
echo -e "\n[1/3] Khởi động Docker Containers..."
cd /home/tuss/human-resources
docker compose up -d

# 2. Bật Backend NestJS ngầm
echo -e "\n[2/3] Khởi động Backend NestJS (Port 3001)..."
cd /home/tuss/human-resources/backend
# Kiểm tra nếu chưa chạy thì bật
if ! ss -tulpn | grep -q ':3001 '; then
  nohup node dist/main.js > /home/tuss/human-resources/backend.log 2>&1 &
  echo "-> Backend đã được bật tại http://localhost:3001"
else
  echo "-> Backend đã đang chạy sẵn tại http://localhost:3001"
fi

# 3. Bật Frontend Next.js ngầm
echo -e "\n[3/3] Khởi động Frontend Next.js (Port 3000)..."
cd /home/tuss/human-resources/frontend
if ! ss -tulpn | grep -q ':3000 '; then
  nohup npm run start -- -p 3000 > /home/tuss/human-resources/frontend.log 2>&1 &
  echo "-> Frontend đã được bật tại http://localhost:3000"
else
  echo "-> Frontend đã đang chạy sẵn tại http://localhost:3000"
fi

echo -e "\n=================================================="
echo "🎉 TẤT CẢ DỊCH VỤ ĐÃ SẴN SÀNG:"
echo "👉 1. Giao diện người dùng (Frontend):  http://localhost:3000"
echo "👉 2. Backend API (NestJS):             http://localhost:3001"
echo "👉 3. n8n Automation Engine:           http://localhost:5678"
echo "👉 4. pgAdmin Quản trị Database:        http://localhost:5050"
echo "=================================================="
