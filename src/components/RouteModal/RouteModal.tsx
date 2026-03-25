import { useEffect, useRef, type ReactNode } from 'react';
import './RouteModal.css';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
}

export function RouteModal({
  isOpen,
  onClose,
  children,
  ariaLabel = 'Detalle de ruta',
}: RouteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    modalRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="route-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="route-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="route-modal__close"
          onClick={onClose}
          aria-label="Cerrar ventana"
          type="button"
        >
          &#x2715;
        </button>

        <div className="route-modal__body">{children}</div>
      </div>
    </div>
  );
}
