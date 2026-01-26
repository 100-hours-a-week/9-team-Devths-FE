#!/bin/bash
set -e

echo "===== AfterInstall: 환경 설정 및 PM2 준비 ====="

DEPLOY_DIR="/var/www/devths-fe"

# 1. PM2 설치 확인 및 설치
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2를 설치합니다..."
    sudo npm install -g pm2
    echo "✅ PM2 설치 완료"
else
    echo "✅ PM2가 이미 설치되어 있습니다."
fi

# 2. PM2 로그 디렉토리 생성
echo "📁 PM2 로그 디렉토리를 생성합니다..."
sudo mkdir -p /var/log/pm2
sudo chown -R ubuntu:ubuntu /var/log/pm2

# 3. 파일 권한 설정
echo "🔒 파일 권한을 설정합니다..."
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;

# server.js는 실행 가능하도록
if [ -f "$DEPLOY_DIR/server.js" ]; then
    sudo chmod 755 "$DEPLOY_DIR/server.js"
fi

# 4. 소유자 설정 (ubuntu 사용자가 실행)
echo "👤 소유자를 ubuntu:ubuntu로 변경합니다..."
sudo chown -R ubuntu:ubuntu "$DEPLOY_DIR"

# 5. PM2 startup 설정 (처음 한 번만 필요하지만, 멱등성 보장)
echo "🚀 PM2 startup 설정을 확인합니다..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

echo "✅ AfterInstall 완료"
