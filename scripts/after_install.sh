#!/bin/bash
set -e

echo "===== AfterInstall: 파일 권한 설정 ====="

DEPLOY_DIR="/var/www/devths-fe"

echo "파일 권한을 설정합니다..."
sudo find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
sudo find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;

# Nginx가 파일을 읽을 수 있도록 소유자 설정
echo "소유자를 ubuntu:www-data로 변경합니다..."
sudo chown -R ubuntu:www-data "$DEPLOY_DIR"

echo "✅ AfterInstall 완료"
