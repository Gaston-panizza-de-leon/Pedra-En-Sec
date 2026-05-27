import type { Church } from '../../types';
import { FaStar, FaXmark, FaLocationDot, FaPhone, FaEnvelope, FaClock, FaUsers, FaCircleInfo, FaMap, FaGlobe } from 'react-icons/fa6';
import { CHURCH_PLACEHOLDER } from '../../utils/imagePlaceholder';
import './ChurchPopup.css';

const ICON_SIZE = 15;

interface ChurchPopupProps {
  church: Church;
  onClose: () => void;
}

export function ChurchPopup({ church, onClose }: ChurchPopupProps) {
  const getRatingStars = (rating?: string) => {
    if (!rating) return null;
    const ratingNum = parseFloat(rating);
    const stars = Math.round(ratingNum);
    return Array.from({ length: Math.min(5, Math.max(0, stars)) }, (_, i) => (
      <FaStar key={i} size={ICON_SIZE} style={{ color: '#e8a317' }} />
    ));
  };

  const imageUrl = church.image?.[0]?.contentUrl;
  const rating = church.aggregateRating?.ratingValue;
  const reviewCount = church.aggregateRating?.reviewCount;
  const mapsLink = church.geo
    ? `https://www.google.com/maps?q=${church.geo.latitude},${church.geo.longitude}`
    : null;

  return (
    <div className="church-popup">
      <button className="church-popup__close" onClick={onClose} aria-label="Cerrar">
        <FaXmark size={18} />
      </button>

      {imageUrl && (
        <img src={imageUrl} alt={church.name} className="church-popup__image" onError={(e) => { (e.target as HTMLImageElement).src = CHURCH_PLACEHOLDER; }} />
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
              <strong><FaLocationDot size={ICON_SIZE} /> Ubicación:</strong>
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
              <strong><FaPhone size={ICON_SIZE} /> Teléfono:</strong>
              <a href={`tel:${church.telephone}`}>{church.telephone}</a>
            </div>
          )}

          {church.email && (
            <div className="church-popup__info-item">
              <strong><FaEnvelope size={ICON_SIZE} /> Email:</strong>
              <a href={`mailto:${church.email}`}>{church.email}</a>
            </div>
          )}

          {church.openingHours && (
            <div className="church-popup__info-item">
              <strong><FaClock size={ICON_SIZE} /> Horarios:</strong>
              <p>{church.openingHours}</p>
            </div>
          )}

          {rating && (
            <div className="church-popup__info-item">
              <strong><FaStar size={ICON_SIZE} style={{ color: '#e8a317' }} /> Valoración:</strong>
              <p>
                {getRatingStars(rating)} <span style={{ verticalAlign: 'middle' }}>{rating}</span>
                {reviewCount && ` (${reviewCount} reseñas)`}
              </p>
            </div>
          )}

          {church.maximumAttendeeCapacity && (
            <div className="church-popup__info-item">
              <strong><FaUsers size={ICON_SIZE} /> Capacidad:</strong>
              <p>{church.maximumAttendeeCapacity} personas</p>
            </div>
          )}

          {church.additionalProperty && church.additionalProperty.length > 0 && (
            <div className="church-popup__info-item">
              <strong><FaCircleInfo size={ICON_SIZE} /> Información adicional:</strong>
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
              <FaMap size={ICON_SIZE} /> Ver en Google Maps
            </a>
          )}
          {church.url && (
            <a
              href={church.url}
              target="_blank"
              rel="noopener noreferrer"
              className="church-popup__action-btn church-popup__action-btn--web"
            >
              <FaGlobe size={ICON_SIZE} /> Sitio web
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
