#!/bin/bash
set -e

echo "===== ValidateService: SSR 배포 검증 ====="

# 1. PM2 프로세스 상태 확인
echo "🔍 PM2 프로세스 상태를 확인합니다..."
if ! sudo -u ubuntu pm2 list | grep -q "devths-fe"; then
  echo "❌ PM2 프로세스 'devths-fe'가 실행 중이지 않습니다"
  sudo -u ubuntu pm2 logs devths-fe --lines 50
  exit 1
fi

# PM2 프로세스가 online 상태인지 확인
PM2_STATUS=$(sudo -u ubuntu pm2 jlist | jq -r '.[] | select(.name=="devths-fe") | .pm2_env.status')
if [ "$PM2_STATUS" != "online" ]; then
  echo "❌ PM2 프로세스 상태가 비정상입니다: $PM2_STATUS"
  sudo -u ubuntu pm2 logs devths-fe --lines 50
  exit 1
fi
echo "✅ PM2 프로세스가 정상 실행 중입니다 (상태: $PM2_STATUS)"

# 2. Node.js 서버 헬스체크 (localhost:3000)
echo "🔍 Node.js 서버 헬스체크 (localhost:3000)..."
sleep 2  # 서버 완전 시작 대기
NODE_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")

if [ "$NODE_HTTP_CODE" -eq 200 ] || [ "$NODE_HTTP_CODE" -eq 301 ] || [ "$NODE_HTTP_CODE" -eq 302 ] || [ "$NODE_HTTP_CODE" -eq 304 ]; then
  echo "✅ Node.js 서버 HTTP 응답 코드: $NODE_HTTP_CODE - 정상"
else
  echo "❌ Node.js 서버 HTTP 응답 코드: $NODE_HTTP_CODE - 비정상"
  echo "로그를 확인합니다:"
  sudo -u ubuntu pm2 logs devths-fe --lines 50
  exit 1
fi

# 3. Nginx 상태 확인
echo "🔍 Nginx 상태를 확인합니다..."
if ! sudo systemctl is-active --quiet nginx; then
  echo "❌ Nginx가 실행 중이지 않습니다"
  exit 1
fi
echo "✅ Nginx가 정상 실행 중입니다"

# 4. Nginx를 통한 외부 접근 테스트 (localhost:80)
echo "🔍 Nginx 프록시 헬스체크 (localhost:80)..."
NGINX_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")

if [ "$NGINX_HTTP_CODE" -eq 200 ] || [ "$NGINX_HTTP_CODE" -eq 301 ] || [ "$NGINX_HTTP_CODE" -eq 302 ] || [ "$NGINX_HTTP_CODE" -eq 304 ]; then
  echo "✅ Nginx HTTP 응답 코드: $NGINX_HTTP_CODE - 정상"
else
  echo "⚠️  Nginx HTTP 응답 코드: $NGINX_HTTP_CODE"
  echo "⚠️  Nginx가 아직 리버스 프록시로 설정되지 않았을 수 있습니다."
  echo "⚠️  /etc/nginx/sites-available/frontend 설정을 확인하세요."
fi

# 5. 배포 디렉토리 파일 확인 (SSR 구조)
echo "🔍 배포 파일 구조를 확인합니다..."
DEPLOY_DIR="/var/www/devths-fe"
if [ ! -f "$DEPLOY_DIR/package.json" ]; then
  echo "❌ package.json 파일이 존재하지 않습니다"
  exit 1
fi

if [ ! -d "$DEPLOY_DIR/.next" ]; then
  echo "❌ .next 디렉토리가 존재하지 않습니다"
  exit 1
fi

if [ ! -d "$DEPLOY_DIR/node_modules" ]; then
  echo "❌ node_modules 디렉토리가 존재하지 않습니다"
  exit 1
fi

echo "✅ SSR 배포 파일 구조가 정상입니다"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ValidateService 완료 - SSR 배포가 성공적으로 완료되었습니다"
echo "📌 Node.js 서버: http://localhost:3000 ✅"
echo "📌 Nginx: http://localhost:80 (리버스 프록시 설정 필요)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
