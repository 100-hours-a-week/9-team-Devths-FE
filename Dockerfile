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

# 빌드 결과물만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# 실행
CMD ["pnpm", "start"]