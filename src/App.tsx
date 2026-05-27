import { lazy, Suspense } from 'react';
import { Header } from './components/Header/Header';
import { HomeView } from './views/Home/HomeView';
import { QuizModal } from './components/QuizModal/QuizModal';
import { AuthModal } from './components/AuthModal/AuthModal';
import { Loader } from './components/Loader/Loader';
import { useAppStore } from './store/useAppStore';
import { useGuidedMode } from './hooks/useGuidedMode';
import './App.css';

// Carga diferida de la vista de detalle (incluye el optimizador de ruta).
const RouteDetailView = lazy(() =>
  import('./views/RouteDetail/RouteDetailView').then((m) => ({
    default: m.RouteDetailView,
  })),
);

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const isQuizOpen = useAppStore((s) => s.isQuizOpen);
  const closeQuiz = useAppStore((s) => s.closeQuiz);
  const isAuthOpen = useAppStore((s) => s.isAuthOpen);
  const closeAuth = useAppStore((s) => s.closeAuth);

  // Activate guided mode hook at the app level
  useGuidedMode();

  return (
    <div className="app">
      {/* Skip-to-content (accessibility) */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      <div className="app__content">
        {currentView === 'home' && <HomeView />}
        {currentView === 'routeDetail' && (
          <Suspense fallback={<Loader text="Cargando ruta…" />}>
            <RouteDetailView />
          </Suspense>
        )}
      </div>

      <footer className="app__footer" role="contentinfo">
        <p>
          © 2026 Pedra en Sec – Patrimoni de les Illes Balears ·{' '}
          <a
            href="https://ich.unesco.org/en/RL/art-of-dry-stone-walling-knowledge-and-techniques-01393"
            target="_blank"
            rel="noopener noreferrer"
          >
            UNESCO
          </a>
        </p>
      </footer>

      <QuizModal isOpen={isQuizOpen} onClose={closeQuiz} />
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </div>
  );
}