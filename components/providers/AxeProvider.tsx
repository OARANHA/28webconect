'use client';

import { useEffect } from 'react';
import axe from 'axe-core';

// Only import and run axe in development mode
const AxeProvider = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Configure axe accessibility rules
      axe.configure({
        rules: [
          {
            id: 'color-contrast',
            enabled: false, // Disable color contrast rule in development
          },
        ],
      });

      // Run axe accessibility check
      axe.run(document.body, (err, results) => {
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
