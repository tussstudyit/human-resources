#!/bin/bash
set -e

echo "=========================================================="
echo "🔄 BẮT ĐẦU CẬP NHẬT CODE & RE-DEPLOY TRÊN VPS"
echo "🌐 Domain: cvresources.tech"
echo "=========================================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Kéo code mới nhất từ Git
echo -e "\n[1/4] Kéo code mới nhất từ branch main..."
git pull origin main

# 2. Cập nhật Backend (nếu cần hoặc build lại)
echo -e "\n[2/4] Kiểm tra & Rebuild Backend..."
cd "$PROJECT_ROOT/backend"
if [ -f "package.json" ]; then
    npm install --silent
    npx prisma generate
    # Đẩy thay đổi cấu trúc bảng nếu schema.prisma có sửa đổi
    npx prisma db push --skip-generate
    npm run build
    pm2 restart hr-backend || pm2 start dist/main.js --name "hr-backend"
    echo "-> Backend đã được cập nhật và khởi động lại thành công!"
fi

# 3. Cập nhật Frontend Next.js
echo -e "\n[3/4] Kiểm tra & Rebuild Frontend Next.js..."
cd "$PROJECT_ROOT/frontend"
if [ -f "package.json" ]; then
    npm install --silent
    npm run build
    pm2 restart hr-frontend || pm2 start npm --name "hr-frontend" -- start -- -p 3000
    echo "-> Frontend đã được cập nhật và khởi động lại thành công!"
fi

# 4. Kiểm tra sức khỏe dịch vụ
echo -e "\n[4/4] Kiểm tra trạng thái hệ thống..."
sleep 2
pm2 list

echo "=========================================================="
echo "✅ CẬP NHẬT HOÀN TẤT! HỆ THỐNG ĐÃ SẴN SÀNG:"
echo "👉 Frontend: https://cvresources.tech"
echo "👉 Backend:  https://api.cvresources.tech"
echo "👉 n8n:      https://n8n.cvresources.tech"
echo "=========================================================="
