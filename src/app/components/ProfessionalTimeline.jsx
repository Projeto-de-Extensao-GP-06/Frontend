import { CalendarDays, GraduationCap, BriefcaseBusiness } from "lucide-react";
import "../../styles/professional-timeline.css";

const defaultItems = [
  { icon: CalendarDays, year: "2019", description: "Início da atuação jurídica" },
  { icon: GraduationCap, title: "PUC Campinas", description: "Especialização em Direito Contratual" },
  { icon: BriefcaseBusiness, title: "Experiência", description: "Atuação em grandes escritórios" },
];

export function ProfessionalTimeline({ items = defaultItems, className = "" }) {
  return (
    <div className={`pro-timeline ${className}`.trim()}>
      <ul className="pro-timeline__list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title || item.year} className="pro-timeline__item">
              {Icon && <Icon className="pro-timeline__icon" size={25} strokeWidth={1.5} aria-hidden="true" />}
              {item.year && <span className="pro-timeline__year">{item.year}</span>}
              {item.title && <span className="pro-timeline__title">{item.title}</span>}
              <span className="pro-timeline__desc">{item.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ProfessionalTimeline;
