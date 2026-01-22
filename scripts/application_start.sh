#!/bin/bash
set -e

echo "===== ApplicationStart: 서비스 복구 및 Nginx 재시작 ====="

AVAILABLE_DIR="/etc/nginx/sites-available"
ENABLED_DIR="/etc/nginx/sites-enabled"

# 🔧 Maintenance 모드 비활성화
echo "🔧 Maintenance 모드를 비활성화합니다..."

# 1. 유지보수 링크 제거
if [ -L "${ENABLED_DIR}/maintenance" ]; then
    sudo rm "${ENABLED_DIR}/maintenance"
    echo "✅ maintenance 링크를 제거했습니다."
fi

# 2. 프런트엔드 사이트 링크 다시 연결
if [ -f "${AVAILABLE_DIR}/dev-frontend" ]; then
    sudo ln -sf "${AVAILABLE_DIR}/dev-frontend" "${ENABLED_DIR}/dev-frontend"
    echo "✅ dev-frontend 링크를 복구했습니다."
else
    echo "❌ 에러: ${AVAILABLE_DIR}/dev-frontend 원본 파일이 없습니다!"
    exit 1
fi

# Nginx 검증 및 재시작
echo "Nginx 설정을 검증합니다..."
sudo nginx -t

echo "Nginx를 다시 로드합니다..."
sudo systemctl reload nginx || sudo systemctl restart nginx

# 상태 확인
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx가 정상적으로 실행 중입니다."
else
    echo "❌ Nginx 시작 실패"
    exit 1
fi

echo "✅ ApplicationStart 완료 (배포 종료)"
