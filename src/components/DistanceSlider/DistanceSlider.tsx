import './DistanceSlider.css';

const MIN_KM = 1;
const MAX_KM = 20;

interface DistanceSliderProps {
  value: number;
  onChange: (km: number) => void;
  churchCount: number;
}

export function DistanceSlider({ value, onChange, churchCount }: DistanceSliderProps) {
  return (
    <div className="distance-slider">
      <div className="distance-slider__header">
        <span className="distance-slider__label">Radio de búsqueda</span>
        <span className="distance-slider__value">{value} km</span>
      </div>
      <div className="distance-slider__control">
        <span className="distance-slider__min">{MIN_KM} km</span>
        <input
          type="range"
          className="distance-slider__input"
          min={MIN_KM}
          max={MAX_KM}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Distancia máxima a iglesias"
        />
        <span className="distance-slider__max">{MAX_KM} km</span>
      </div>
      <div className="distance-slider__footer">
        <span className="distance-slider__count">
          {churchCount} {churchCount === 1 ? 'iglesia' : 'iglesias'} en {value} km
        </span>
      </div>
    </div>
  );
}
