import './Loader.css';

interface LoaderProps {
  text?: string;
}

export function Loader({ text = 'Cargando…' }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
