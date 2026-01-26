import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  // output: 'standalone', // 도커 환경이 아니기에 일반 빌드 사용
  images: {
    unoptimized: true, // SSR 환경에서 이미지 최적화 비활성화
  },
};

export default nextConfig;
