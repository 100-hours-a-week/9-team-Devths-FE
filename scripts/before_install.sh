#!/bin/bash
set -e

echo "===== BeforeInstall: 기존 파일 정리 및 디렉토리 준비 ====="

# 배포 디렉토리
DEPLOY_DIR="/var/www/devths-fe"

# nginx 설정 파일 경로
NGINX_CONF_DIR="/etc/nginx/conf.d"
DEVTHS_CONF="${NGINX_CONF_DIR}/devths.conf"
MAINTENANCE_CONF="${NGINX_CONF_DIR}/maintenance.conf"

# Maintenance 모드 활성화
echo "🚧 Maintenance 모드를 활성화합니다..."

# devths.conf 비활성화
if [ -f "$DEVTHS_CONF" ]; then
  sudo mv "$DEVTHS_CONF" "${DEVTHS_CONF}.disabled"
  echo "✅ devths.conf를 비활성화했습니다"
else
  echo "⚠️ devths.conf를 찾을 수 없습니다"
fi

# maintenance.conf 활성화
if [ -f "${MAINTENANCE_CONF}.disabled" ]; then
  sudo mv "${MAINTENANCE_CONF}.disabled" "$MAINTENANCE_CONF"
  echo "✅ maintenance.conf를 활성화했습니다"
elif [ -f "$MAINTENANCE_CONF" ]; then
  echo "ℹ️ maintenance.conf가 이미 활성화되어 있습니다"
else
  echo "⚠️ maintenance.conf를 찾을 수 없습니다"
fi

# nginx 설정 테스트
sudo nginx -t

# nginx reload
sudo systemctl reload nginx
echo "✅ Maintenance 모드가 활성화되었습니다"

# 기존 디렉토리가 있다면 백업
if [ -d "$DEPLOY_DIR" ]; then
  BACKUP_DIR="/var/www/backup/devths-fe-$(date +'%Y%m%d_%H%M%S')"
  echo "기존 배포 파일을 백업합니다: $BACKUP_DIR"
  mkdir -p /var/www/backup
  mv "$DEPLOY_DIR" "$BACKUP_DIR"

  # 오래된 백업 삭제 (최근 5개만 유지)
  cd /var/www/backup
  ls -t | tail -n +6 | xargs -r rm -rf
fi

# 새로운 배포 디렉토리 생성
echo "새로운 배포 디렉토리를 생성합니다: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "✅ BeforeInstall 완료"
