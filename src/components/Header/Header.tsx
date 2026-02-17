import { useAppStore } from '../../store/useAppStore';
import './Header.css';

export function Header() {
  const setView = useAppStore((s) => s.setView);
  const currentView = useAppStore((s) => s.currentView);
  const clearRoute = useAppStore((s) => s.clearRoute);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const stopGuidedMode = useAppStore((s) => s.stopGuidedMode);

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
        {/* Inline SVG stone icon */}
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
    </header>
  );
}
