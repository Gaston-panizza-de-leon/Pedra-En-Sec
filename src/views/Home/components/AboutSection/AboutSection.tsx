import './AboutSection.css';

const baseUrl = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

function withBase(path: string): string {
  return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
}

interface TeamMember {
  name: string;
  role: string;
  photo: string;
  alt: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Gregori Serra Vinogradov',
    role: 'Estudiante de la UIB',
    photo: withBase('/images/placeholder-1.svg'),
    alt: 'Foto de Gregori Serra Vinogradov',
  },
  {
    name: 'Lucas Gastón Panizza de León',
    role: 'Estudiante de la UIB',
    photo: withBase('/images/placeholder-2.svg'),
    alt: 'Foto de Lucas Gastón Panizza de León',
  },
];

export function AboutSection() {
  return (
    <section className="about-section" aria-labelledby="about-heading">
      <div className="about-section__container">
        <h2 id="about-heading" className="about-section__title">
          ¿Quiénes somos?
        </h2>

        <div className="about-section__grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="about-section__card">
              <figure className="about-section__card-photo">
                <img
                  src={member.photo}
                  alt={member.alt}
                  loading="lazy"
                />
              </figure>
              <div className="about-section__card-info">
                <h3 className="about-section__card-name">{member.name}</h3>
                <p className="about-section__card-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
