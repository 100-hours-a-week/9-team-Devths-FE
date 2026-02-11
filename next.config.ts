import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone', // Docker 환경에서 경량 이미지 생성
  images: {
    unoptimized: true, // SSR 환경에서 이미지 최적화 비활성화
  },
};

export default nextConfig;
