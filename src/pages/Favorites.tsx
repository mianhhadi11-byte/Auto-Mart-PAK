import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CarCard } from '../components/CarCard';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';

export function Favorites() {
  usePageTitle(
    'Saved Cars',
    'Your saved cars on AutoMart Pakistan. Keep a shortlist of the cars you love and compare them side by side.',
  );
  const { favorites, allCars, user } = useApp();
  const saved = favorites
    .map((id) => allCars.find((car) => car.id === id))
    .filter((car): car is NonNullable<typeof car> => Boolean(car));

  return (
    <div className="favorites-page">
      <PageHeader
        eyebrow="Your shortlist"
        title="Saved Cars"
        description={
          saved.length > 0
            ? `You have ${saved.length} ${saved.length === 1 ? 'car' : 'cars'} saved. Compare them or get in touch with the seller when you are ready.`
            : 'Tap the heart on any listing to keep it here for later.'
        }
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Saved Cars' }]}
      >
        <div className="page-header__stats">
          <span><Heart size={16} /> {saved.length} saved</span>
          <span><Search size={16} /> {allCars.length} cars on AutoMart</span>
        </div>
      </PageHeader>

      <section className="section saved-section">
        <div className="container">
          {saved.length === 0 ? (
            <EmptyState
              icon={<Heart size={30} />}
              title="No saved cars yet"
              description="Browse the marketplace and tap the heart icon on any car to build your shortlist."
              action={{ to: '/buy', label: 'Browse cars' }}
            >
              {!user && (
                <p className="empty-state__hint">
                  <Link to="/login">Log in</Link> to keep your saved cars across visits.
                </p>
              )}
            </EmptyState>
          ) : (
            <>
              <div className="saved-toolbar">
                <p>
                  <strong>{saved.length}</strong> {saved.length === 1 ? 'car' : 'cars'} in your shortlist
                </p>
                <div className="saved-toolbar__actions">
                  <Link to="/compare" className="btn btn--primary btn--sm">
                    Compare saved cars <ArrowRight size={15} />
                  </Link>
                  <Link to="/buy" className="btn btn--ghost btn--sm">
                    Add more cars
                  </Link>
                </div>
              </div>
              <div className="car-grid">
                {saved.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
              <div className="saved-note">
                <Trash2 size={16} />
                <span>Remove a car from your shortlist by tapping the heart icon on its card.</span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
