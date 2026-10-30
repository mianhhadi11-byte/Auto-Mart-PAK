import { Link } from 'react-router-dom';
import { ArrowRight, Car, Compass, Home } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export function NotFound() {
  usePageTitle('Page not found', 'The page you are looking for does not exist on AutoMart Pakistan.');

  return (
    <div className="notfound-page">
      <div className="container notfound">
        <span className="notfound__code">404</span>
        <span className="notfound__icon">
          <Compass size={30} />
        </span>
        <h1>This road leads nowhere.</h1>
        <p>
          The page you are looking for may have been moved, sold or never existed. Let&apos;s get you
          back to the marketplace.
        </p>
        <div className="notfound__actions">
          <Link to="/" className="btn btn--primary btn--lg">
            <Home size={17} /> Back to home
          </Link>
          <Link to="/buy" className="btn btn--ghost btn--lg">
            <Car size={17} /> Browse cars <ArrowRight size={16} />
          </Link>
        </div>
        <div className="notfound__links">
          <Link to="/compare">Compare cars</Link>
          <Link to="/sell">Sell your car</Link>
          <Link to="/contact">Contact us</Link>
        </div>
      </div>
    </div>
  );
}
