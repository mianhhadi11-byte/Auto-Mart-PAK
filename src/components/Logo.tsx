import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/format';

interface LogoProps {
  variant?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export function Logo({ variant = 'dark', compact = false, className }: LogoProps) {
  const gradientId = useId();
  return (
    <Link to="/" className={cn('logo', `logo--${variant}`, className)} aria-label="AutoMart Pakistan — Home">
      <svg className="logo__mark" viewBox="0 0 52 52" role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2C7DFF" />
            <stop offset="1" stopColor="#0B3A8F" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="50" height="50" rx="15" fill={`url(#${gradientId})`} />
        <rect x="1" y="1" width="50" height="50" rx="15" fill="none" stroke="rgba(255,255,255,.18)" />
        <path d="M26 10.5 40.5 41h-7.1l-2.6-6H21.2l-2.6 6h-7.1L26 10.5Zm0 10.2-2.9 8.4h5.8L26 20.7Z" fill="#fff" />
        <path d="M7.5 27.5h6.2M38.3 27.5h6.2" stroke="#8CC2FF" strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
        <circle cx="42.5" cy="11.5" r="2.6" fill="#F3BE57" />
      </svg>
      {!compact && (
        <span className="logo__text">
          <span className="logo__name">
            Auto<span>Mart</span>
          </span>
          <span className="logo__country">PAKISTAN</span>
        </span>
      )}
    </Link>
  );
}
