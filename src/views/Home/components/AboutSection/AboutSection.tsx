import './AboutSection.css';

interface TeamMember {
  name: string;
  role: string;
  initial: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Gregori Serra Vinogradov',
    role: 'Estudiante de la UIB',
    initial: 'G',
  },
  {
    name: 'Lucas Gastón Panizza de León',
    role: 'Estudiante de la UIB',
    initial: 'L',
  },
];

export function AboutSection() {
  return (
    <section className="about-section" aria-labelledby="about-heading">
      <div className="about-section__container">
        <div className="about-section__intro">
          <p className="about-section__overline">El equipo</p>
          <h2 id="about-heading" className="about-section__title">
            ¿Quiénes somos?
          </h2>
          <p className="about-section__description">
            Somos un equipo apasionado por el patrimonio cultural de las Islas Baleares.
            Nuestro objetivo es acercar la riqueza de la arquitectura en piedra seca
            a todo el mundo, combinando tradición milenaria con tecnología moderna.
          </p>
        </div>

        <div className="about-section__grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="about-section__card">
              <div className="about-section__avatar-wrapper">
                <div className="about-section__avatar">
                  <span className="about-section__initial">{member.initial}</span>
                </div>
              </div>
              <div className="about-section__card-body">
                <h3 className="about-section__card-name">{member.name}</h3>
                <p className="about-section__card-role">{member.role}</p>
              </div>
              <div className="about-section__card-accent" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
