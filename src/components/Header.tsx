import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  GitCompareArrows,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  Plus,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/format';
import { useLockBody } from '../hooks/usePageTitle';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Buy Cars', to: '/buy' },
  { label: 'Sell Your Car', to: '/sell' },
  { label: 'Compare Cars', to: '/compare' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export function Header() {
  const { pathname } = useLocation();
  const { user, favorites, compare, logout } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useLockBody(mobileOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userOpen]);

  const isActive = (to: string) => {
    if (to === '/') return pathname === '/';
    if (to === '/buy') return pathname === '/buy' || pathname.startsWith('/cars/');
    return pathname === to;
  };

  return (
    <header className={cn('site-header', scrolled && 'is-scrolled')}>
      <div className="topbar">
        <div className="container topbar__inner">
          <span className="topbar__note">
            <ShieldCheck size={14} /> Pakistan&apos;s trusted car marketplace
          </span>
          <div className="topbar__links">
            <a href="tel:+923001234567">
              <Phone size={13} /> +92 300 1234567
            </a>
            <a href="mailto:hello@automart.pk">
              <Mail size={13} /> hello@automart.pk
            </a>
            <span className="topbar__hours">
              <Clock size={13} /> Mon–Sat, 9am–8pm
            </span>
          </div>
        </div>
      </div>

      <div className="nav-wrap">
        <div className="container nav">
          <Logo />

          <nav className="nav__links" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn('nav__link', isActive(item.to) && 'is-active')}
              >
                {item.label}
                {item.to === '/compare' && compare.length > 0 && (
                  <span className="nav__badge">{compare.length}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="nav__actions">
            <Link to="/favorites" className="icon-btn" aria-label="Saved cars">
              <Heart size={19} />
              {favorites.length > 0 && <span className="icon-btn__badge">{favorites.length}</span>}
            </Link>

            {user ? (
              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-chip"
                  onClick={() => setUserOpen((open) => !open)}
                  aria-expanded={userOpen}
                  aria-haspopup="menu"
                >
                  <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-chip__name">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={15} className={cn('user-chip__chevron', userOpen && 'is-open')} />
                </button>
                {userOpen && (
                  <div className="user-menu__panel" role="menu">
                    <div className="user-menu__head">
                      <span className="avatar avatar--lg">{user.name.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                    <Link to="/my-listings" role="menuitem">
                      <LayoutDashboard size={16} /> My Listings
                    </Link>
                    <Link to="/favorites" role="menuitem">
                      <Heart size={16} /> Saved Cars
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setUserOpen(false);
                      }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav__login">
                <User size={17} /> Log In
              </Link>
            )}

            <Link to="/sell" className="btn btn--primary btn--sm nav__cta">
              <Plus size={16} /> Post Your Ad
            </Link>

            <button
              type="button"
              className="nav__burger"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn('mobile-menu', mobileOpen && 'is-open')}>
        <div className="mobile-menu__overlay" onClick={() => setMobileOpen(false)} />
        <div className="mobile-menu__panel">
          <div className="mobile-menu__head">
            <span className="mobile-menu__title">Browse AutoMart</span>
            <button type="button" className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <nav className="mobile-menu__links" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn('mobile-menu__link', isActive(item.to) && 'is-active')}
              >
                {item.label}
                {item.to === '/compare' && compare.length > 0 && (
                  <span className="nav__badge">{compare.length}</span>
                )}
              </Link>
            ))}
          </nav>

          <div className="mobile-menu__quick">
            <Link to="/favorites" className="mobile-quick">
              <Heart size={18} />
              <span>
                Saved cars
                <small>{favorites.length} saved</small>
              </span>
            </Link>
            <Link to="/compare" className="mobile-quick">
              <GitCompareArrows size={18} />
              <span>
                Compare
                <small>{compare.length} selected</small>
              </span>
            </Link>
          </div>

          <div className="mobile-menu__actions">
            {user ? (
              <>
                <Link to="/my-listings" className="btn btn--ghost btn--block">
                  <LayoutDashboard size={16} /> My Listings
                </Link>
                <button type="button" className="btn btn--ghost btn--block" onClick={logout}>
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn--ghost btn--block">
                <User size={16} /> Log In / Sign Up
              </Link>
            )}
            <Link to="/sell" className="btn btn--primary btn--block">
              <Plus size={16} /> Post Your Ad
            </Link>
          </div>

          <div className="mobile-menu__contact">
            <a href="tel:+923001234567">
              <Phone size={15} /> +92 300 1234567
            </a>
            <span>
              <BadgeCheck size={15} /> Verified sellers across Pakistan
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
