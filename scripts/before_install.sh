#!/bin/bash
set -e

echo "===== BeforeInstall: 유지보수 모드 활성화 및 백업 ====="

# 경로 설정
AVAILABLE_DIR="/etc/nginx/sites-available"
ENABLED_DIR="/etc/nginx/sites-enabled"
DEPLOY_DIR="/home/ubuntu/fe"

# 🚧 Maintenance 모드 활성화 (링크 교체)
echo "🚧 Maintenance 모드를 활성화합니다..."

# 1. 기존 프런트엔드 링크 제거
if [ -L "${ENABLED_DIR}/fe" ]; then
    sudo rm "${ENABLED_DIR}/fe"
    echo "✅ frontend 링크를 제거했습니다."
fi

# 2. 유지보수 페이지 링크 생성
if [ -f "${AVAILABLE_DIR}/maintenance" ]; then
    sudo ln -sf "${AVAILABLE_DIR}/maintenance" "${ENABLED_DIR}/maintenance"
    echo "✅ maintenance 링크를 생성했습니다."
else
    echo "❌ 에러: ${AVAILABLE_DIR}/maintenance 파일이 없습니다!"
    exit 1
fi

# Nginx 적용
sudo nginx -t
sudo systemctl reload nginx
echo "✅ Maintenance 모드 전환 완료"

# --- 기존 배포 파일 백업 로직 ---
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_ROOT="/home/ubuntu/fe/backups"
    BACKUP_DIR="${BACKUP_ROOT}/$(date +'%Y%m%d_%H%M%S')"
    echo "기존 배포 파일을 백업합니다: $BACKUP_DIR"

    # 백업 디렉토리 생성
    sudo mkdir -p "$BACKUP_DIR"

    # backups 디렉토리를 제외한 나머지 파일/디렉토리 백업
    cd "$DEPLOY_DIR"
    for item in *; do
        if [ "$item" != "backups" ] && [ -e "$item" ]; then
            echo "백업 중: $item"
            sudo mv "$item" "$BACKUP_DIR/"
        fi
    done

    # 숨김 파일도 백업 (backups 제외)
    for item in .[!.]*; do
        if [ -e "$item" ]; then
            echo "백업 중: $item"
            sudo mv "$item" "$BACKUP_DIR/"
        fi
    done

    # 오래된 백업 삭제 (최근 5개 유지)
    echo "오래된 백업을 정리합니다..."
    sudo find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" -printf '%T@ %p\n' 2>/dev/null | \
        sort -rn | tail -n +6 | cut -d' ' -f2- | \
        while IFS= read -r old_backup; do
            echo "삭제: $old_backup"
            sudo rm -rf "$old_backup"
        done
else
    sudo mkdir -p "$DEPLOY_DIR"
fi
echo "✅ BeforeInstall 완료"
