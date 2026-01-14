// Performance monitoring utilities
// Industry best practice: Monitor Core Web Vitals and custom metrics

export interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  loadTime?: number // Page load time
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window === 'undefined') return
    this.init()
  }

  private init() {
    // Monitor Core Web Vitals
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeFCP()
    this.observeTTFB()
    this.observeLoadTime()
  }

  private observeLCP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
        this.logMetric('LCP', this.metrics.lcp)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  private observeFID() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            this.metrics.fid = entry.processingStart - entry.startTime
            this.logMetric('FID', this.metrics.fid)
          }
        })
      })
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  private observeCLS() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.metrics.cls = clsValue
          }
        })
        this.logMetric('CLS', this.metrics.cls)
      })
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  private observeFCP() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.logMetric('FCP', this.metrics.fcp)
          }
        })
      })
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (e) {
      // PerformanceObserver not supported
    }
  }

  private observeTTFB() {
    if (typeof window === 'undefined' || !('PerformanceNavigationTiming' in window)) return

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart
        this.logMetric('TTFB', this.metrics.ttfb)
      }
    } catch (e) {
      // Not supported
    }
  }

  private observeLoadTime() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart
        this.logMetric('Load Time', this.metrics.loadTime)
      }
    })
  }

  private logMetric(name: string, value: number | undefined) {
    if (value !== undefined && process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${value.toFixed(2)}ms`)
    }
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Report metrics to analytics (implement based on your analytics provider)
  reportMetrics() {
    if (typeof window === 'undefined') return

    // Example: Send to analytics
    // You can integrate with Google Analytics, Vercel Analytics, etc.
    const metrics = this.getMetrics()
    
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(metrics)
      // })
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
let monitorInstance: PerformanceMonitor | null = null

export function initPerformanceMonitor(): PerformanceMonitor {
  if (typeof window === 'undefined') {
    return {} as PerformanceMonitor
  }
  
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor()
  }
  return monitorInstance
}

export function getPerformanceMonitor(): PerformanceMonitor | null {
  return monitorInstance
}
