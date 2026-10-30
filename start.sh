#!/usr/bin/env bash
set -eo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  export NVM_DIR="$HOME/.nvm"
  [ ! -s "$NVM_DIR/nvm.sh" ] || . "$NVM_DIR/nvm.sh"
fi
command -v node >/dev/null || { echo "Node.js is required" >&2; exit 1; }
cd "$SCRIPT_DIR"
docker compose up -d postgres pgadmin n8n
if ! curl -fsS --max-time 2 http://localhost:3001/ >/dev/null 2>&1; then
  [ -f backend/dist/main.js ] || { echo "Run npm run build in backend first" >&2; exit 1; }
  (cd backend && nohup node --env-file=.env dist/main.js > "$SCRIPT_DIR/backend.log" 2>&1 &)
fi
if ! curl -fsS --max-time 2 http://localhost:3000/careers >/dev/null 2>&1; then
  [ -f frontend/.next/BUILD_ID ] || { echo "Run npm run build -- --webpack in frontend first" >&2; exit 1; }
  (cd frontend && nohup npm run start -- -p 3000 > "$SCRIPT_DIR/frontend.log" 2>&1 &)
fi
for url in http://localhost:3001/ http://localhost:3000/careers http://localhost:5679/healthz; do
  ready=false
  for attempt in {1..15}; do
    if curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then ready=true; break; fi
    sleep 1
  done
  [ "$ready" = true ] || { echo "Service not ready: $url. Check project logs." >&2; exit 1; }
done
printf '%s\n' 'Frontend: http://localhost:3000' 'Backend: http://localhost:3001' 'n8n: http://localhost:5679' 'pgAdmin: http://localhost:5050'
