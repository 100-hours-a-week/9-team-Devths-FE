#!/bin/bash
set -e

echo "===== ApplicationStart: Node.js 서버 시작 및 Nginx 복구 ====="

AVAILABLE_DIR="/etc/nginx/sites-available"
ENABLED_DIR="/etc/nginx/sites-enabled"
DEPLOY_DIR="/var/www/devths-fe"

# 1. 기존 PM2 프로세스 중지 (존재하는 경우)
echo "🛑 기존 PM2 프로세스를 중지합니다..."
sudo -u ubuntu pm2 delete devths-fe 2>/dev/null || echo "기존 프로세스가 없습니다."

# 2. PM2로 Next.js 서버 시작 (pnpm start 사용)
echo "🚀 PM2로 Next.js 서버를 시작합니다..."
cd "$DEPLOY_DIR"
sudo -u ubuntu pm2 start npm --name devths-fe --time -- start

# 3. PM2 프로세스 상태 확인
echo "⏳ PM2 프로세스 상태를 확인합니다..."
sleep 3
if sudo -u ubuntu pm2 list | grep -q "devths-fe"; then
    echo "✅ Next.js 서버가 시작되었습니다."
    sudo -u ubuntu pm2 info devths-fe
else
    echo "❌ Next.js 서버 시작 실패"
    sudo -u ubuntu pm2 logs devths-fe --lines 50
    exit 1
fi

# 4. PM2 프로세스 저장 (재부팅 시 자동 시작)
echo "💾 PM2 프로세스를 저장합니다..."
sudo -u ubuntu pm2 save

# 5. 🔧 Maintenance 모드 비활성화
echo "🔧 Maintenance 모드를 비활성화합니다..."

# 유지보수 링크 제거
if [ -L "${ENABLED_DIR}/maintenance" ]; then
    sudo rm "${ENABLED_DIR}/maintenance"
    echo "✅ maintenance 링크를 제거했습니다."
fi

# 프런트엔드 사이트 링크 다시 연결
if [ -f "${AVAILABLE_DIR}/frontend" ]; then
    sudo ln -sf "${AVAILABLE_DIR}/frontend" "${ENABLED_DIR}/frontend"
    echo "✅ frontend 링크를 복구했습니다."
else
    echo "❌ 에러: ${AVAILABLE_DIR}/frontend 원본 파일이 없습니다!"
    exit 1
fi

# 6. Nginx 검증 및 재시작
echo "🔄 Nginx 설정을 검증합니다..."
sudo nginx -t

echo "🔄 Nginx를 다시 로드합니다..."
sudo systemctl reload nginx || sudo systemctl restart nginx

# Nginx 상태 확인
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx가 정상적으로 실행 중입니다."
else
    echo "❌ Nginx 시작 실패"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ApplicationStart 완료"
echo "📌 Next.js 서버: http://localhost:3000 (PM2 클러스터 모드)"
echo "📌 Nginx: 리버스 프록시 설정 필요 (/etc/nginx/sites-available/frontend)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
