'use client';

import { useEffect } from 'react';
import { configureAxe, axeCore } from '@axe-core/react';

// Only import and run axe in development mode
const AxeProvider = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      configureAxe({
        rules: [
          {
            id: 'color-contrast',
            enabled: false, // Disable color contrast rule in development
          },
        ],
      });
      
      // Run axe accessibility check
      axeCore.run(document.body, (err, results) => {
        if (err) {
          console.error('Error running axe:', err);
        } else {
          console.log('Accessibility violations found:', results.violations.length);
          if (results.violations.length > 0) {
            console.table(results.violations);
          }
        }
      });
    }
  }, []);

  return null;
};

export default AxeProvider;