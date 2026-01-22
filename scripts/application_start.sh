#!/bin/bash
set -e

echo "===== ApplicationStart: nginx 재시작 ====="

# nginx 설정 파일 경로
NGINX_CONF_DIR="/etc/nginx/conf.d"
DEVTHS_CONF="${NGINX_CONF_DIR}/devths.conf"
MAINTENANCE_CONF="${NGINX_CONF_DIR}/maintenance.conf"

# Maintenance 모드 비활성화
echo "🔧 Maintenance 모드를 비활성화합니다..."

# maintenance.conf 비활성화
if [ -f "$MAINTENANCE_CONF" ]; then
  sudo mv "$MAINTENANCE_CONF" "${MAINTENANCE_CONF}.disabled"
  echo "✅ maintenance.conf를 비활성화했습니다"
else
  echo "⚠️ maintenance.conf를 찾을 수 없습니다"
fi

# devths.conf 활성화
if [ -f "${DEVTHS_CONF}.disabled" ]; then
  sudo mv "${DEVTHS_CONF}.disabled" "$DEVTHS_CONF"
  echo "✅ devths.conf를 활성화했습니다"
elif [ -f "$DEVTHS_CONF" ]; then
  echo "ℹ️ devths.conf가 이미 활성화되어 있습니다"
else
  echo "⚠️ devths.conf를 찾을 수 없습니다"
fi

echo "✅ Maintenance 모드가 비활성화되었습니다"

# nginx 설정 테스트
echo "nginx 설정 파일을 검증합니다..."
sudo nginx -t

# nginx 재시작
echo "nginx를 재시작합니다..."
sudo systemctl reload nginx || sudo systemctl restart nginx

# nginx 상태 확인
if sudo systemctl is-active --quiet nginx; then
  echo "✅ nginx가 정상적으로 실행 중입니다"
else
  echo "❌ nginx 시작 실패"
  exit 1
fi

echo "✅ ApplicationStart 완료"
