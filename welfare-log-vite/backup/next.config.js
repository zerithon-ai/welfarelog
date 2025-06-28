/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경 최적화
  webpack: (config, { dev }) => {
    if (dev) {
      // 파일 감지 설정 개선 (WSL + Windows 호환성)
      config.watchOptions = {
        poll: 1000, // 1초마다 파일 변경 감지
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

module.exports = nextConfig;