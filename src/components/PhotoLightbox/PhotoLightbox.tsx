import { useEffect, useRef } from 'react';
import './PhotoLightbox.css';

interface PhotoLightboxProps {
  isOpen: boolean;
  photos: string[];
  currentIndex: number;
  routeName: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PhotoLightbox({
  isOpen,
  photos,
  currentIndex,
  routeName,
  onClose,
  onNext,
  onPrev,
}: PhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="photo-lightbox-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        className="photo-lightbox"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Galería de fotos expandida"
      >
        {/* Close button */}
        <button
          className="photo-lightbox__close"
          onClick={onClose}
          aria-label="Cerrar galería"
          type="button"
        >
          ✕
        </button>

        {/* Main photo */}
        <div className="photo-lightbox__container">
          <img
            src={currentPhoto}
            alt={`Foto ${currentIndex + 1} de la ruta ${routeName}`}
            className="photo-lightbox__image"
          />
        </div>

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              className="photo-lightbox__nav photo-lightbox__nav--prev"
              onClick={onPrev}
              aria-label="Foto anterior"
              type="button"
            >
              ‹
            </button>

            <button
              className="photo-lightbox__nav photo-lightbox__nav--next"
              onClick={onNext}
              aria-label="Siguiente foto"
              type="button"
            >
              ›
            </button>
          </>
        )}

        {/* Photo counter */}
        <div className="photo-lightbox__counter">
          {currentIndex + 1} / {photos.length}
        </div>

        {/* Thumbnails */}
        {photos.length > 1 && (
          <div className="photo-lightbox__thumbnails">
            {photos.map((photo, index) => (
              <button
                key={index}
                className={`photo-lightbox__thumbnail ${
                  index === currentIndex ? 'photo-lightbox__thumbnail--active' : ''
                }`}
                onClick={() => {
                  // Navigate to this photo
                  const diff = index - currentIndex;
                  if (diff > 0) {
                    for (let i = 0; i < diff; i++) onNext();
                  } else {
                    for (let i = 0; i < Math.abs(diff); i++) onPrev();
                  }
                }}
                aria-label={`Ver foto ${index + 1}`}
                type="button"
              >
                <img src={photo} alt={`Miniatura ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
