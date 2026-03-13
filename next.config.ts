import { execSync } from 'child_process'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

function getAppVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim().replace(/^v/, '')
  } catch {
    return '0.0.0'
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    APP_VERSION: getAppVersion()
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    })
    return config
  }
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
