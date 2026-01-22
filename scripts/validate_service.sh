#!/bin/bash
set -e

echo "===== ValidateService: 배포 검증 ====="

# nginx 상태 확인
if ! sudo systemctl is-active --quiet nginx; then
  echo "❌ nginx가 실행 중이지 않습니다"
  exit 1
fi

# 로컬 HTTP 요청 테스트 (nginx가 localhost:80에서 서비스 중인 경우)
echo "로컬 HTTP 요청을 테스트합니다..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 302 ]; then
  echo "✅ HTTP 응답 코드: $HTTP_CODE - 정상"
else
  echo "❌ HTTP 응답 코드: $HTTP_CODE - 비정상"
  exit 1
fi

# 배포 디렉토리 파일 확인
DEPLOY_DIR="/var/www/devths-fe"
if [ ! -f "$DEPLOY_DIR/index.html" ] && [ ! -f "$DEPLOY_DIR/_next/static" ]; then
  echo "❌ 배포 파일이 올바르게 존재하지 않습니다"
  exit 1
fi

echo "✅ ValidateService 완료 - 배포가 성공적으로 완료되었습니다"
