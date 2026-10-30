import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../utils/format';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  link?: { to: string; label: string };
  align?: 'left' | 'center';
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  link,
  align = 'left',
  action,
}: SectionHeadingProps) {
  return (
    <div className={cn('section-heading', align === 'center' && 'section-heading--center')}>
      <div className="section-heading__text">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
      {link && (
        <Link to={link.to} className="section-heading__link">
          {link.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
