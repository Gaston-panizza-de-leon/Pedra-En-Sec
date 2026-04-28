import { Header } from './components/Header/Header';
import { HomeView } from './views/Home/HomeView';
import { RouteDetailView } from './views/RouteDetail/RouteDetailView';
import { QuizModal } from './components/QuizModal/QuizModal';
import { useAppStore } from './store/useAppStore';
import { useGuidedMode } from './hooks/useGuidedMode';
import './App.css';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const isQuizOpen = useAppStore((s) => s.isQuizOpen);
  const closeQuiz = useAppStore((s) => s.closeQuiz);

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
        {currentView === 'routeDetail' && <RouteDetailView />}
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
    </div>
  );
}
