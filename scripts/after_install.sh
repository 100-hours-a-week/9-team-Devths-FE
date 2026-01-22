#!/bin/bash
set -e

echo "===== AfterInstall: 파일 권한 설정 ====="

DEPLOY_DIR="/var/www/devths-fe"

# 파일 권한 설정
echo "파일 권한을 설정합니다..."
find "$DEPLOY_DIR" -type f -exec chmod 644 {} \;
find "$DEPLOY_DIR" -type d -exec chmod 755 {} \;

# 소유자 변경 (nginx가 www-data 그룹으로 실행되는 경우)
echo "소유자를 ubuntu:ubuntu로 변경합니다..."
chown -R ubuntu:ubuntu "$DEPLOY_DIR"

echo "✅ AfterInstall 완료"
