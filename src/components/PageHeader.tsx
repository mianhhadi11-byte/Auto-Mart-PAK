import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: Array<{ label: string; to?: string }>;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, breadcrumb, children }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="container page-header__inner">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
              {index < breadcrumb.length - 1 && <ChevronRight size={13} />}
            </span>
          ))}
        </nav>
        <span className="eyebrow eyebrow--light">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </section>
  );
}
