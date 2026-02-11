# 1. Build Stage
FROM node:22-alpine AS builder

# 빌드 시점에 주입받을 변수 정의
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID

# ARG를 ENV로 전환해야 빌드
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

# 디렉토리 생성
WORKDIR /app

# pnpm 설치 및 의존성 복사
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 소스 복사 및 빌드
COPY . .
RUN pnpm run build

# 2. Runtime Stage (최종 이미지 경량화)
FROM node:22-alpine
WORKDIR /app

# standalone 모드에서는 node 사용자로 실행 (보안 강화)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone 빌드 결과물 복사 (필요한 의존성만 포함)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# standalone 모드에서는 node로 직접 실행 (pnpm 불필요)
CMD ["node", "server.js"]