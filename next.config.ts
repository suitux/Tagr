import { readFileSync } from 'fs'
import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    APP_VERSION: packageJson.version
  }
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
