/**
 * Performance Monitor
 * Tracks performance metrics and user interactions for analytics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.startTime = performance.now();
    this.isTracking = false;
    this.observers = [];
  }

  /**
   * Start performance tracking
   */
  startTracking() {
    try {
      this.isTracking = true;
      this.trackPageLoad();
      this.setupPerformanceObservers();
      this.trackCoreWebVitals();
      console.log('Performance monitoring started');
    } catch (error) {
      console.error('Failed to start performance tracking:', error);
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (!window.performance || !window.performance.timing) {
      console.warn('Performance API not available');
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const navigation = performance.navigation;

        this.metrics.pageLoad = {
          // Navigation timing
          navigationStart: timing.navigationStart,
          domainLookup: timing.domainLookupEnd - timing.domainLookupStart,
          connection: timing.connectEnd - timing.connectStart,
          request: timing.responseStart - timing.requestStart,
          response: timing.responseEnd - timing.responseStart,
          domProcessing: timing.domComplete - timing.domLoading,
          
          // Key metrics
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          loadComplete: timing.loadEventEnd - timing.navigationStart,
          
          // Navigation type
          navigationType: navigation.type,
          redirectCount: navigation.redirectCount
        };

        this.sendMetrics('page_load', this.metrics.pageLoad);
      }, 0);
    });
  }

  /**
   * Set up performance observers
   */
  setupPerformanceObservers() {
    // Resource timing observer
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.trackResourceTiming(entry);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Long task observer
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.trackLongTask(entry);
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);

        // Navigation observer
        const navigationObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.trackNavigationTiming(entry);
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

      } catch (error) {
        console.warn('Some performance observers not supported:', error);
      }
    }
  }

  /**
   * Track Core Web Vitals
   */
  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // First Input Delay (FID)
    this.trackFID();
    
    // Cumulative Layout Shift (CLS)
    this.trackCLS();
  }

  /**
   * Track Largest Contentful Paint
   */
  trackLCP() {
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.metrics.lcp = {
            value: lastEntry.startTime,
            element: lastEntry.element?.tagName || 'unknown'
          };
          
          this.sendMetrics('lcp', this.metrics.lcp);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }
  }

  /**
   * Track First Input Delay
   */
  trackFID() {
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.metrics.fid = {
              value: entry.processingStart - entry.startTime,
              inputType: entry.name
            };
            
            this.sendMetrics('fid', this.metrics.fid);
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }

  /**
   * Track Cumulative Layout Shift
   */
  trackCLS() {
    if ('PerformanceObserver' in window) {
      try {
        let clsValue = 0;
        
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.metrics.cls = { value: clsValue };
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
        
        // Send CLS on page unload
        window.addEventListener('beforeunload', () => {
          if (this.metrics.cls) {
            this.sendMetrics('cls', this.metrics.cls);
          }
        });
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }
  }

  /**
   * Track resource timing
   */
  trackResourceTiming(entry) {
    // Only track significant resources
    if (entry.duration > 100 || entry.transferSize > 50000) {
      const resourceData = {
        name: entry.name,
        type: this.getResourceType(entry.name),
        duration: entry.duration,
        size: entry.transferSize,
        cached: entry.transferSize === 0 && entry.decodedBodySize > 0
      };
      
      this.sendMetrics('resource_timing', resourceData);
    }
  }

  /**
   * Track long tasks
   */
  trackLongTask(entry) {
    const longTaskData = {
      duration: entry.duration,
      startTime: entry.startTime,
      attribution: entry.attribution?.[0]?.name || 'unknown'
    };
    
    this.sendMetrics('long_task', longTaskData);
  }

  /**
   * Track navigation timing
   */
  trackNavigationTiming(entry) {
    const navigationData = {
      type: entry.type,
      redirectCount: entry.redirectCount,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart
    };
    
    this.sendMetrics('navigation_timing', navigationData);
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.css')) return 'css';
    if (url.includes('.js')) return 'javascript';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    return 'other';
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, data = {}) {
    if (!this.isTracking) return;

    const eventData = {
      event: eventName,
      timestamp: performance.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };

    this.sendMetrics('custom_event', eventData);
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    const errorData = {
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: performance.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    this.sendMetrics('error', errorData);
  }

  /**
   * Track user interaction
   */
  trackInteraction(type, target, data = {}) {
    const interactionData = {
      type: type,
      target: target,
      timestamp: performance.now(),
      ...data
    };

    this.sendMetrics('interaction', interactionData);
  }

  /**
   * Send metrics to analytics
   */
  sendMetrics(type, data) {
    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', type, {
        event_category: 'Performance',
        custom_map: data
      });
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metric [${type}]:`, data);
    }

    // Could also send to other analytics services here
    this.sendToCustomAnalytics(type, data);
  }

  /**
   * Send to custom analytics endpoint
   */
  sendToCustomAnalytics(type, data) {
    // Example: send to custom analytics endpoint
    // This would be implemented based on your analytics setup
    
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({
        type: type,
        data: data,
        timestamp: Date.now(),
        session: this.getSessionId()
      });
      
      // navigator.sendBeacon('/analytics', payload);
    }
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('performance_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('performance_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Stop tracking and cleanup
   */
  stopTracking() {
    this.isTracking = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
    
    console.log('Performance monitoring stopped');
  }
}