/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(svg)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[name].[hash].[ext]',
            publicPath: '/_next/static/images/',
            outputPath: 'static/images/',
            esModule: false
          }
        }
      ]
    })
    return config
  }
}

module.exports = nextConfig
