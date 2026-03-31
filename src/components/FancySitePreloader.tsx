import React, { useEffect, useState } from 'react';

const FancySitePreloader = () => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Remove preloader after app is ready
    const timer = setTimeout(() => {
      const preloader = document.getElementById('site-preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => {
          preloader?.remove();
          setIsHidden(true);
        }, 300);
      }
    }, 500); // Small delay to ensure React has rendered

    return () => clearTimeout(timer);
  }, []);

  if (isHidden) return null;

  return null; // The preloader is rendered in HTML, not in React
};

export default FancySitePreloader;
