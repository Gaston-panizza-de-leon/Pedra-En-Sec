import type { Church } from '../../types';
import './ChurchPopup.css';

interface ChurchPopupProps {
  church: Church;
  onClose: () => void;
}

export function ChurchPopup({ church, onClose }: ChurchPopupProps) {
  const getRatingStars = (rating?: string) => {
    if (!rating) return null;
    const ratingNum = parseFloat(rating);
    const stars = Math.round(ratingNum);
    return '⭐'.repeat(Math.min(5, Math.max(0, stars)));
  };

  const imageUrl = church.image?.[0];
  const rating = church.aggregateRating?.ratingValue;
  const reviewCount = church.aggregateRating?.reviewCount;
  const mapsLink = church.geo
    ? `https://www.google.com/maps?q=${church.geo.latitude},${church.geo.longitude}`
    : null;

  return (
    <div className="church-popup">
      <button className="church-popup__close" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>

      {imageUrl && (
        <img src={imageUrl} alt={church.name} className="church-popup__image" />
      )}

      <div className="church-popup__content">
        <h2 className="church-popup__title">{church.name}</h2>

        {church.alternateName && (
          <p className="church-popup__alternate-name">{church.alternateName}</p>
        )}

        {church.description && (
          <p className="church-popup__description">{church.description}</p>
        )}

        <div className="church-popup__info">
          {church.address && (
            <div className="church-popup__info-item">
              <strong>📍 Ubicación:</strong>
              <p>
                {church.address.streetAddress && (
                  <>
                    {church.address.streetAddress}
                    <br />
                  </>
                )}
                {church.address.addressLocality && (
                  <>
                    {church.address.addressLocality}
                    {church.address.addressRegion && `, ${church.address.addressRegion}`}
                  </>
                )}
              </p>
            </div>
          )}

          {church.telephone && (
            <div className="church-popup__info-item">
              <strong>📞 Teléfono:</strong>
              <a href={`tel:${church.telephone}`}>{church.telephone}</a>
            </div>
          )}

          {church.email && (
            <div className="church-popup__info-item">
              <strong>✉️ Email:</strong>
              <a href={`mailto:${church.email}`}>{church.email}</a>
            </div>
          )}

          {church.openingHours && (
            <div className="church-popup__info-item">
              <strong>🕐 Horarios:</strong>
              <p>{church.openingHours}</p>
            </div>
          )}

          {rating && (
            <div className="church-popup__info-item">
              <strong>⭐ Valoración:</strong>
              <p>
                {getRatingStars(rating)} {rating}
                {reviewCount && ` (${reviewCount} reseñas)`}
              </p>
            </div>
          )}

          {church.maximumAttendeeCapacity && (
            <div className="church-popup__info-item">
              <strong>👥 Capacidad:</strong>
              <p>{church.maximumAttendeeCapacity} personas</p>
            </div>
          )}

          {church.additionalProperty && church.additionalProperty.length > 0 && (
            <div className="church-popup__info-item">
              <strong>ℹ️ Información adicional:</strong>
              <ul className="church-popup__additional-properties">
                {church.additionalProperty.map((prop, idx) => (
                  <li key={idx}>
                    <strong>{prop.name}:</strong> {prop.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="church-popup__actions">
          {mapsLink && (
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="church-popup__action-btn church-popup__action-btn--maps"
            >
              🗺️ Ver en Google Maps
            </a>
          )}
          {church.url && (
            <a
              href={church.url}
              target="_blank"
              rel="noopener noreferrer"
              className="church-popup__action-btn church-popup__action-btn--web"
            >
              🌐 Sitio web
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
