import { useEffect, useRef, type ReactNode } from 'react';
import './SwipePanel.css';

interface SwipePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

export function SwipePanel({
  isOpen,
  onClose,
  children,
  ariaLabel = 'Panel de detalle',
}: SwipePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /* Trap focus & close on Escape */
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    panelRef.current?.focus();

    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="swipe-panel-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className="swipe-panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {/* Drag handle (mobile) */}
        <div className="swipe-panel__handle-bar" aria-hidden="true">
          <div className="swipe-panel__handle" />
        </div>

        {/* Close button */}
        <button
          className="swipe-panel__close"
          onClick={onClose}
          aria-label="Cerrar panel"
        >
          ✕
        </button>

        <div className="swipe-panel__body">{children}</div>
      </aside>
    </>
  );
}
