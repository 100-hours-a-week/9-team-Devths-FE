#!/bin/bash
set -e

echo "===== ApplicationStart: nginx 재시작 ====="

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
