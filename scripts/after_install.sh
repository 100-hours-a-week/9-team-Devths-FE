#!/bin/bash
set -e

echo "===== AfterInstall: 환경 설정 및 의존성 설치 ====="

DEPLOY_DIR="/var/www/devths-fe"

# 1. pnpm 설치 확인 및 설치
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm을 설치합니다..."
    sudo npm install -g pnpm
    echo "✅ pnpm 설치 완료"
else
    echo "✅ pnpm이 이미 설치되어 있습니다."
fi

# 2. PM2 설치 확인 및 설치
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2를 설치합니다..."
    sudo npm install -g pm2
    echo "✅ PM2 설치 완료"
else
    echo "✅ PM2가 이미 설치되어 있습니다."
fi

# 3. PM2 로그 디렉토리 생성
echo "📁 PM2 로그 디렉토리를 생성합니다..."
sudo mkdir -p /var/log/pm2
sudo chown -R ubuntu:ubuntu /var/log/pm2

# 4. 파일 권한 설정
echo "🔒 파일 권한을 설정합니다..."
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;

# 5. 소유자 설정 (ubuntu 사용자가 실행)
echo "👤 소유자를 ubuntu:ubuntu로 변경합니다..."
sudo chown -R ubuntu:ubuntu "$DEPLOY_DIR"

# 6. 의존성 설치
echo "📦 의존성을 설치합니다..."
cd "$DEPLOY_DIR"
sudo -u ubuntu pnpm install --frozen-lockfile --prod

# 7. PM2 startup 설정
echo "🚀 PM2 startup 설정을 확인합니다..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

echo "✅ AfterInstall 완료"
