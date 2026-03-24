import { useState, useEffect } from 'react'; // Added hooks
import { useAppStore } from '../../store/useAppStore';
import './Header.css';

import HikerIcon from '../../assets/hiker.svg?react'; // Adjust path as needed

export function Header() {
  const setView = useAppStore((s) => s.setView);
  const currentView = useAppStore((s) => s.currentView);
  const clearRoute = useAppStore((s) => s.clearRoute);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const stopGuidedMode = useAppStore((s) => s.stopGuidedMode);

  // --- Hiker Logic Start ---
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const stepGap = 25; // Change this number to make steps closer or further apart (pixels)

  useEffect(() => {
    const handleUpdate = () => {
      // 1. Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // 2. Calculate how many steps fit in the current window width
      const count = Math.floor(window.innerWidth / stepGap);
      setStepCount(count);
    };

    handleUpdate(); // Initial call
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate); // Recalculate if window size changes

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, []);

  const steps = Array.from({ length: stepCount });
  // --- Hiker Logic End ---

  const goHome = () => {
    stopGuidedMode();
    closeDetail();
    clearRoute();
    setView('home');
  };

  return (
    <header className="header" role="banner">
      <button
        className="header__logo"
        onClick={goHome}
        aria-label="Ir a la página principal – Pedra en Sec"
      >
        <svg
          className="header__logo-icon"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 26 L8 18 L14 20 L18 14 L24 16 L28 10 L30 26 Z"
            fill="var(--color-green-700)"
            opacity="0.85"
          />
          <path
            d="M2 28 L6 22 L12 24 L16 17 L22 19 L26 12 L30 28 Z"
            fill="var(--color-stone-500)"
            opacity="0.6"
          />
        </svg>
        Pedra en Sec
      </button>

      <nav className="header__nav" aria-label="Navegación principal">
        <button
          className={`header__btn ${currentView === 'home' ? 'header__btn--active' : ''}`}
          onClick={goHome}
          aria-current={currentView === 'home' ? 'page' : undefined}
        >
          Mapa
        </button>
      </nav>

      {/* --- HIKER PROGRESS TRACK --- */}
      <div className="header__hiker-track">
        {/* --- FOOTPRINTS --- */}
        <div className="header__footprints-container">
          {steps.map((_, index) => {
            // 1. Calculate the exact pixel position for this step
            const pixelPosition = index * stepGap;

            // 2. Convert that pixel position to a percentage of the screen width
            // to compare it with your scrollProgress (which is 0 to 100)
            const stepPercent = (pixelPosition / window.innerWidth) * 100;

            const isVisible = scrollProgress > (stepPercent + 1); // add a little of delay (+1)

            return (
              <svg
                key={index}
                className={`header__footprint ${isVisible ? 'header__footprint--visible' : ''}`}
                /* Position it using pixels so the gap stays consistent */
                style={{ left: `${pixelPosition}px` }}
                viewBox="0 0 24 24"
              >
                <path d="M10,2C8.89,2 8,2.89 8,4C8,4.61 8.28,5.16 8.71,5.53C8.28,5.9 8,6.45 8,7.06C8,7.67 8.28,8.22 8.71,8.59C8.28,8.96 8,9.5 8,10.12C8,11.23 8.89,12.12 10,12.12C11.11,12.12 12,11.23 12,10.12C12,9.5 11.72,8.96 11.29,8.59C11.72,8.22 12,7.67 12,7.06C12,6.45 11.72,5.9 11.29,5.53C11.72,5.16 12,4.61 12,4C12,2.89 11.11,2 10,2Z" />
              </svg>
            );
          })}
        </div>

        {/* --- HIKER --- */}
        <div
          className="header__hiker"
          style={{ transform: `translateX(${scrollProgress}vw)` }}
        >
          <HikerIcon width="20" height="20" />
        </div>
      </div>

    </header>
  );
}