#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 BẮT ĐẦU TỰ ĐỘNG CÀI ĐẶT & TRIỂN KHAI HUMAN RESOURCES AI"
echo "🌐 Domain: cvresources.tech"
echo "=========================================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Cấu hình 4GB Swap RAM ảo
echo -e "\n[1/7] Cấu hình 4GB Swap RAM ảo..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "-> Đã tạo 4GB Swap thành công!"
else
    echo "-> Swapfile đã tồn tại."
fi

# 2. Cài đặt các gói cơ bản
echo -e "\n[2/7] Cập nhật Ubuntu & cài đặt công cụ cần thiết..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw jq debian-keyring debian-archive-keyring apt-transport-https

# 3. Cài đặt Docker & Docker Compose
echo -e "\n[3/7] Cài đặt Docker Engine..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "-> Docker đã được cài đặt."
else
    echo "-> Docker đã có sẵn."
fi

# 4. Cài đặt Node.js 22 & PM2
echo -e "\n[4/7] Cài đặt Node.js v22 & PM2 Process Manager..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
fi
npm install -g pm2

# 5. Cài đặt & cấu hình Caddy Web Server (Tự động cấp SSL HTTPS)
echo -e "\n[5/7] Cài đặt Caddy Server (Tự động cấp chứng chỉ SSL HTTPS)..."
if ! command -v caddy &> /dev/null; then
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg --yes
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt-get update -y
    apt-get install -y caddy
fi

cat << 'EOF' > /etc/caddy/Caddyfile
cvresources.tech, www.cvresources.tech {
    reverse_proxy 127.0.0.1:3000
}

api.cvresources.tech {
    reverse_proxy 127.0.0.1:3001
}

n8n.cvresources.tech {
    reverse_proxy 127.0.0.1:5678 {
        flush_interval -1
    }
}
EOF

systemctl restart caddy
systemctl enable caddy
echo "-> Caddy đã được cấu hình với SSL tự động cho cvresources.tech!"

# 6. Khởi động Docker Containers (Postgres, n8n) với mật khẩu chuẩn
echo -e "\n[6/7] Khởi động PostgreSQL 16 & n8n Engine..."
cat << 'EOF' > "$PROJECT_ROOT/.env"
POSTGRES_USER=hr_admin
POSTGRES_PASSWORD=hr_secure_password_2026
POSTGRES_DB=hr_core_db
POSTGRES_PORT=5432
DATABASE_URL="postgresql://hr_admin:hr_secure_password_2026@localhost:5432/hr_core_db?schema=public"
N8N_PORT=5678
N8N_ENCRYPTION_KEY=hr_n8n_encryption_secret_key_123
WEBHOOK_URL="https://n8n.cvresources.tech/"
EOF

docker compose up -d postgres n8n

echo "-> Đang chờ PostgreSQL khởi động..."
until docker exec hr_postgres pg_isready -U hr_admin -d hr_core_db 2>/dev/null; do
    sleep 2
done
echo "-> PostgreSQL đã sẵn sàng!"

# 7. Cài đặt & Build Backend NestJS
echo -e "\n[7/7] Cài đặt & Khởi động Backend & Frontend..."
cd "$PROJECT_ROOT/backend"
cat << 'EOF' > .env
DATABASE_URL="postgresql://hr_admin:hr_secure_password_2026@localhost:5432/hr_core_db?schema=public"
JWT_SECRET="hr_jwt_secret_super_key_2026_antigravity"
JWT_EXPIRES_IN="7d"
PORT=3001
N8N_URL="http://localhost:5678"
N8N_WELCOME_WEBHOOK_URL="http://localhost:5678/webhook/user-registered"
N8N_IT_PROVISIONING_WEBHOOK_URL="http://localhost:5678/webhook/it-provisioning"
N8N_CV_WEBHOOK="http://localhost:5678/webhook/process-cv"
N8N_SCHEDULE_WEBHOOK="http://localhost:5678/webhook/schedule-interview"
N8N_REJECTION_WEBHOOK="http://localhost:5678/webhook/rejection-notification"
BACKEND_INTERNAL_URL="https://api.cvresources.tech"
N8N_API_KEY="750845dc3e9ed5275635283ee9a5d186e94aba1dec18590dd3dd92ff14c39b71"
EOF

npm install --legacy-peer-deps
npx prisma db push --accept-data-loss
npm run build
pm2 delete hr-backend 2>/dev/null || true
pm2 start dist/main.js --name "hr-backend"

# Cài đặt & Build Frontend Next.js
cd "$PROJECT_ROOT/frontend"
cat << 'EOF' > .env.local
NEXT_PUBLIC_API_URL="https://api.cvresources.tech"
N8N_URL="https://n8n.cvresources.tech"
EOF

npm install --legacy-peer-deps
npm run build
pm2 delete hr-frontend 2>/dev/null || true
pm2 start npm --name "hr-frontend" -- run start -- -p 3000

# Lưu trạng thái PM2 tự khởi động khi reboot VPS
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# Mở Firewall UFW
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

echo -e "\n=========================================================="
echo "🎉 CHÚC MỪNG! HỆ THỐNG ĐÃ ĐƯỢC DEPLOY THÀNH CÔNG LÊN INTERNET!"
echo "=========================================================="
echo "👉 1. Trang Web HR (Frontend):    https://cvresources.tech"
echo "👉 2. Cổng API (Backend NestJS):  https://api.cvresources.tech"
echo "👉 3. Automation Engine (n8n):   https://n8n.cvresources.tech"
echo "🔒 Chứng chỉ SSL HTTPS đã được cấp tự động hoàn toàn!"
echo "=========================================================="
