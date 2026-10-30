import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CompareBar } from './CompareBar';
import { Toasts } from './Toasts';
import { useApp } from '../context/AppContext';
import { useScrollToTop } from '../hooks/usePageTitle';
import { cn } from '../utils/format';

export function Layout() {
  const { compare } = useApp();
  const { pathname } = useLocation();
  useScrollToTop();
  const showCompareBar = compare.length > 0 && pathname !== '/compare';

  return (
    <div className={cn('app-shell', showCompareBar && 'has-compare-bar')}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <Toasts />
    </div>
  );
}
