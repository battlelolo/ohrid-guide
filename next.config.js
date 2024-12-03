// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['i.imgur.com', 'images.unsplash.com','th.bing.com','sl.bing.net'],
//   },
// };

// module.exports = nextConfig;

const withPWA = require('next-pwa');

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    // 기타 PWA 설정
  },
  images: {
    domains: ['i.imgur.com', 'images.unsplash.com', 'th.bing.com', 'sl.bing.net'],
  },
});