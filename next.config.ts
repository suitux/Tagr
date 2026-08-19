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
  // next 16.3 bumped @swc/helpers to 0.5.23, whose exports map added the
  // "module-sync" condition. Node >= 22.12 honours it, so next/dist's
  // require('@swc/helpers/_/...') resolves to esm/, while the standalone file
  // tracer still resolves it as plain cjs and only copies cjs/. The image then
  // dies with "Cannot find module .../@swc/helpers/esm/_interop_require_default.js".
  // Force the esm build into the trace until the tracer honours module-sync.
  outputFileTracingIncludes: {
    '**/*': [
      './node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/esm/**',
      './node_modules/@swc/helpers/esm/**'
    ]
  },
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
