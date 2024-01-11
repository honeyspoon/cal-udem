const moduleExports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.*.*',
        port: '',
      },
    ],
  },
};

module.exports = moduleExports;
