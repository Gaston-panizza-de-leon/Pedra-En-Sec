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

      <h3 className="info-section__subtitle">
        La Pedra en Sec en las Islas Baleares
      </h3>

      <p className="info-section__text">
        Las Islas Baleares, y en particular la Serra de Tramuntana de Mallorca
        (Patrimonio de la Humanidad desde 2011), albergan uno de los conjuntos
        más espectaculares de arquitectura en piedra seca del Mediterráneo.
        Miles de kilómetros de muros de bancales (<em>marjades</em>) transforman
        las empinadas laderas en superficies cultivables, mientras que
        construcciones como <em>barraques de roter</em>, <em>cases de neu</em>,
        fuentes canalizadas y caminos empedrados forman un paisaje cultural
        único.
      </p>

      <p className="info-section__text">
        Más allá de Mallorca, Menorca conserva su legado megalítico con
        <em> talayots</em>, <em>taulas</em> y <em>navetas</em> construidas con
        la misma filosofía de piedra sobre piedra. Ibiza, por su parte, presenta
        un paisaje agrícola surcado por paredes de piedra que delimitan parcelas
        y protegen los cultivos del viento.
      </p>

      <h3 className="info-section__subtitle">¿Por qué es importante?</h3>

      <div className="info-section__grid">
        <article className="info-section__card">
          <div className="info-section__card-icon" aria-hidden="true">🏛️</div>
          <h4 className="info-section__card-title">Patrimonio Cultural</h4>
          <p className="info-section__card-text">
            Conecta a las comunidades actuales con el saber hacer de sus
            antepasados, transmitido de generación en generación durante
            milenios.
          </p>
        </article>

        <article className="info-section__card">
          <div className="info-section__card-icon" aria-hidden="true">🌿</div>
          <h4 className="info-section__card-title">Sostenibilidad</h4>
          <p className="info-section__card-text">
            Es una construcción 100&nbsp;% ecológica: utiliza materiales
            locales, no genera residuos y favorece la biodiversidad al crear
            hábitats para fauna y flora.
          </p>
        </article>

        <article className="info-section__card">
          <div className="info-section__card-icon" aria-hidden="true">💧</div>
          <h4 className="info-section__card-title">Gestión del Agua</h4>
          <p className="info-section__card-text">
            Los bancales de pedra en sec previenen la erosión, retienen la
            humedad del suelo y canalizan el agua de lluvia de forma eficiente.
          </p>
        </article>

        <article className="info-section__card">
          <div className="info-section__card-icon" aria-hidden="true">🥾</div>
          <h4 className="info-section__card-title">Turismo Responsable</h4>
          <p className="info-section__card-text">
            Las rutas de pedra en sec ofrecen una forma de descubrir el
            patrimonio natural y cultural de las Baleares de manera respetuosa y
            enriquecedora.
          </p>
        </article>
      </div>
    </section>
  );
}
