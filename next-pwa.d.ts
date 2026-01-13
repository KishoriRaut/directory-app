declare module 'next-pwa' {
  import { NextConfig } from 'next'
  
  interface PWAConfig {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    fallbacks?: {
      document?: string
    }
    runtimeCaching?: Array<{
      urlPattern: RegExp | string
      handler: string
      options?: {
        cacheName?: string
        expiration?: {
          maxEntries?: number
          maxAgeSeconds?: number
        }
        cacheableResponse?: {
          statuses?: number[]
        }
        networkTimeoutSeconds?: number
      }
    }>
  }
  
  function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export default withPWA
}
