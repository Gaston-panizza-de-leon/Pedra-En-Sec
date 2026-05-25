import './InfoSection.css';

export function InfoSection() {
  return (
    <section
      className="info-section"
      aria-labelledby="info-heading"
    >
      <h2 id="info-heading" className="info-section__title">
        La Cultura de la Pedra en Sec
      </h2>

      <p className="info-section__text">
        La <strong>pedra en sec</strong> (piedra en seco) es una técnica
        constructiva milenaria que consiste en levantar muros y estructuras
        apilando piedras sin utilizar ningún tipo de mortero ni argamasa. Cada
        piedra es seleccionada y encajada con precisión, creando construcciones
        sorprendentemente resistentes que han perdurado durante siglos.
      </p>

      <div className="info-section__highlight" role="note">
        En 2018, la UNESCO declaró el «Arte de la construcción en piedra en
        seco» como Patrimonio Cultural Inmaterial de la Humanidad, reconociendo
        su valor universal y la necesidad de preservarlo.
      </div>

      {/* ── Editorial rows ── */}
      <div className="info-section__editorial">
        {/* Row 1: text left, image right */}
        <div className="info-section__row">
          <div className="info-section__row-text">
            <h3 className="info-section__subtitle">
              Una técnica milenaria
            </h3>
            <p>
              La <strong>pedra en sec</strong> (piedra en seco) es una técnica
              constructiva milenaria que consiste en levantar muros y estructuras
              apilando piedras sin utilizar ningún tipo de mortero ni argamasa.
              Cada piedra es seleccionada y encajada con precisión, creando
              construcciones sorprendentemente resistentes que han perdurado
              durante siglos.
            </p>
          </div>
          <figure className="info-section__row-image">
            {/* Replace src with your own WebP image */}
            <img
              src="/images/muro-pedra-en-sec.webp"
              alt="Detalle de un muro de piedra en seco mostrando el encaje preciso de las piedras"
              loading="lazy"
            />
            <figcaption>Detalle del encaje artesanal de la piedra en seco</figcaption>
          </figure>
        </div>

        {/* Row 2: image left, text right */}
        <div className="info-section__row info-section__row--reversed">
          <div className="info-section__row-text">
            <h3 className="info-section__subtitle">
              La Pedra en Sec en las Islas Baleares
            </h3>
            <p>
              Las Islas Baleares, y en particular la Serra de Tramuntana de
              Mallorca (Patrimonio de la Humanidad desde 2011), albergan uno de
              los conjuntos más espectaculares de arquitectura en piedra seca
              del Mediterráneo. Miles de kilómetros de muros de bancales
              (<em>marjades</em>) transforman las empinadas laderas en
              superficies cultivables.
            </p>
            <p>
              Construcciones como <em>barraques de roter</em>,{' '}
              <em>cases de neu</em>, fuentes canalizadas y caminos empedrados
              forman un paisaje cultural único. Más allá de Mallorca, Menorca
              conserva su legado megalítico con <em>talayots</em>,{' '}
              <em>taulas</em> y <em>navetas</em>, mientras que Ibiza presenta
              un paisaje agrícola surcado por paredes de piedra que protegen
              los cultivos del viento.
            </p>
          </div>
          <figure className="info-section__row-image">
            {/* Replace src with your own WebP image */}
            <img
              src="/images/cami-pedra-en-sec.webp"
              alt="Camino de piedra en seco en la Serra de Tramuntana"
              loading="lazy"
            />
            <figcaption>Camí de pedra en sec, Serra de Tramuntana</figcaption>
          </figure>
        </div>
      </div>

      {/* ── Visual importance cards ── */}
      <h3 className="info-section__cards-heading">¿Por qué es importante?</h3>

      <div className="info-section__grid">
        <article className="info-section__card" style={{ '--card-bg': 'url(/images/patrimonio.webp)' } as React.CSSProperties}>
          <div className="info-section__card-overlay">
            <h4 className="info-section__card-title">Patrimonio Cultural</h4>
            <p className="info-section__card-text">
              Conecta a las comunidades actuales con el saber hacer de sus
              antepasados, transmitido de generación en generación durante
              milenios.
            </p>
          </div>
        </article>

        <article className="info-section__card" style={{ '--card-bg': 'url(/images/sostenibilidad1.webp)' } as React.CSSProperties}>
          <div className="info-section__card-overlay">
            <h4 className="info-section__card-title">Sostenibilidad</h4>
            <p className="info-section__card-text">
              Es una construcción 100&nbsp;% ecológica: utiliza materiales
              locales, no genera residuos y favorece la biodiversidad al crear
              hábitats para fauna y flora.
            </p>
          </div>
        </article>

        <article className="info-section__card" style={{ '--card-bg': 'url(/images/riego1.webp)' } as React.CSSProperties}>
          <div className="info-section__card-overlay">
            <h4 className="info-section__card-title">Gestión del Agua</h4>
            <p className="info-section__card-text">
              Los bancales de pedra en sec previenen la erosión, retienen la
              humedad del suelo y canalizan el agua de lluvia de forma
              eficiente.
            </p>
          </div>
        </article>

        <article className="info-section__card" style={{ '--card-bg': 'url(/images/turismo1.webp)' } as React.CSSProperties}>
          <div className="info-section__card-overlay">
            <h4 className="info-section__card-title">Turismo Responsable</h4>
            <p className="info-section__card-text">
              Las rutas de pedra en sec ofrecen una forma de descubrir el
              patrimonio natural y cultural de las Baleares de manera respetuosa
              y enriquecedora.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
