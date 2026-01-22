#!/bin/bash
set -e

echo "===== BeforeInstall: 기존 파일 정리 및 디렉토리 준비 ====="

# 배포 디렉토리
DEPLOY_DIR="/var/www/devths-fe"

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
