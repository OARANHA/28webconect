'use client';

import { useEffect } from 'react';

// Performance monitoring component
const PerformanceMonitor = () => {
  useEffect(() => {
    // Track performance metrics
    if ('performance' in window) {
      // Measure First Contentful Paint (FCP)
      const measureFCP = () => {
        new Promise((resolve) => {
          const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                po.disconnect();
                resolve(entry.startTime);
              }
            }
          });
          po.observe({ entryTypes: ['paint'] });
        }).then((startTime) => {
          console.log(`First Contentful Paint: ${Math.round(startTime)} ms`);
          // In a real app, you would send this to your analytics service
          // sendMetricsToAnalytics('FCP', Math.round(startTime));
        });
      };

      // Measure Largest Contentful Paint (LCP)
      const measureLCP = () => {
        new Promise((resolve) => {
          const po = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              resolve(entry);
            }
          });
          po.observe({ entryTypes: ['largest-contentful-paint'] });
        }).then((entry: any) => {
          console.log(`Largest Contentful Paint: ${Math.round(entry.startTime)} ms`);
          // sendMetricsToAnalytics('LCP', Math.round(entry.startTime));
        });
      };

      // Measure Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log(`Cumulative Layout Shift: ${clsValue.toFixed(2)}`);
        // sendMetricsToAnalytics('CLS', clsValue.toFixed(2));
      });
      observer.observe({ entryTypes: ['layout-shift'] });

      // Start measurements
      measureFCP();
      measureLCP();

      // Cleanup
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor;