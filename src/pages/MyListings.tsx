import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Eye,
  Gauge,
  LayoutDashboard,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { formatMileage, formatPKR, timeAgo } from '../utils/format';
import { usePageTitle } from '../hooks/usePageTitle';

export function MyListings() {
  usePageTitle(
    'My Listings',
    'Manage the cars you have listed for sale on AutoMart Pakistan.',
  );
  const { customCars, deleteCar, user } = useApp();
  const mine = user
    ? customCars.filter((car) => car.ownerEmail === user.email)
    : customCars;

  return (
    <div className="my-listings-page">
      <PageHeader
        eyebrow="Seller dashboard"
        title="My Listings"
        description="Manage the cars you have posted on AutoMart Pakistan."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'My Listings' }]}
      >
        <div className="page-header__stats">
          <span><LayoutDashboard size={16} /> {mine.length} active {mine.length === 1 ? 'listing' : 'listings'}</span>
          <span><BadgeCheck size={16} /> {user ? `Signed in as ${user.name}` : 'Guest listings on this device'}</span>
        </div>
      </PageHeader>

      <section className="section my-listings-section">
        <div className="container">
          {!user && (
            <div className="my-listings-banner">
              <div>
                <strong>You are browsing as a guest.</strong>
                <span>Log in to keep your listings tied to your account across devices.</span>
              </div>
              <Link to="/login" className="btn btn--primary btn--sm">Log in</Link>
            </div>
          )}

          {mine.length === 0 ? (
            <EmptyState
              icon={<LayoutDashboard size={30} />}
              title="You have no active listings"
              description="Post your car for free and reach thousands of buyers across Pakistan."
              action={{ to: '/sell', label: 'Post your first ad' }}
            />
          ) : (
            <>
              <div className="my-listings-head">
                <h2>{mine.length} {mine.length === 1 ? 'listing' : 'listings'}</h2>
                <Link to="/sell" className="btn btn--primary btn--sm">
                  <Plus size={15} /> Post another ad
                </Link>
              </div>

              <div className="my-listings-list">
                {mine.map((car) => (
                  <article className="listing-row" key={car.id}>
                    <Link to={`/cars/${car.slug}`} className="listing-row__media">
                      {car.images[0] ? (
                        <img src={car.images[0]} alt={`${car.year} ${car.brand} ${car.model}`} />
                      ) : (
                        <span className="listing-row__placeholder">No photo</span>
                      )}
                    </Link>

                    <div className="listing-row__body">
                      <div className="listing-row__top">
                        <div>
                          <span className="listing-row__brand">{car.brand} · {car.variant}</span>
                          <h3>
                            <Link to={`/cars/${car.slug}`}>{car.year} {car.model}</Link>
                          </h3>
                        </div>
                        <strong className="listing-row__price">{formatPKR(car.price)}</strong>
                      </div>

                      <div className="listing-row__meta">
                        <span><Calendar size={14} /> {car.year}</span>
                        <span><Gauge size={14} /> {formatMileage(car.mileage)}</span>
                        <span><MapPin size={14} /> {car.city}</span>
                        <span><Eye size={14} /> {car.views} views</span>
                      </div>

                      <div className="listing-row__foot">
                        <span className="listing-row__date">Listed {timeAgo(car.dateListed)}</span>
                        <div className="listing-row__actions">
                          <Link to={`/cars/${car.slug}`} className="btn btn--ghost btn--sm">
                            View listing <ArrowRight size={14} />
                          </Link>
                          <button
                            type="button"
                            className="btn btn--danger btn--sm"
                            onClick={() => {
                              if (window.confirm(`Remove your ${car.year} ${car.brand} ${car.model} listing?`)) {
                                deleteCar(car.id);
                              }
                            }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
