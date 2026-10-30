import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Cog,
  Fuel,
  Gauge,
  GitCompareArrows,
  Heart,
  MapPin,
  Sparkles,
} from 'lucide-react';
import type { Car } from '../types';
import { useApp } from '../context/AppContext';
import { cn, estimateMonthly, formatMileage, formatPKR, timeAgo } from '../utils/format';

interface CarCardProps {
  car: Car;
  view?: 'grid' | 'list';
}

export function CarCard({ car, view = 'grid' }: CarCardProps) {
  const { isFavorite, toggleFavorite, isComparing, toggleCompare } = useApp();
  const favorite = isFavorite(car.id);
  const comparing = isComparing(car.id);

  return (
    <article className={cn('car-card', view === 'list' && 'car-card--list')}>
      <div className="car-card__media">
        <Link to={`/cars/${car.slug}`} aria-label={`View ${car.year} ${car.brand} ${car.model}`}>
          {car.images[0] ? (
            <img
              src={car.images[0]}
              alt={`${car.year} ${car.brand} ${car.model} ${car.variant}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="car-card__placeholder">AutoMart</div>
          )}
        </Link>
        <div className="car-card__badges">
          {car.featured && (
            <span className="badge badge--gold">
              <Sparkles size={12} /> Featured
            </span>
          )}
          {car.verified && (
            <span className="badge badge--verified">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
          {car.condition === 'Certified Pre-Owned' && (
            <span className="badge badge--certified">Certified</span>
          )}
        </div>
        <button
          type="button"
          className={cn('save-btn', favorite && 'is-saved')}
          onClick={() => toggleFavorite(car.id)}
          aria-label={favorite ? 'Remove from saved cars' : 'Save this car'}
          aria-pressed={favorite}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <span className="car-card__age">{timeAgo(car.dateListed)}</span>
      </div>

      <div className="car-card__body">
        <div className="car-card__topline">
          <span className="car-card__brand">{car.brand}</span>
          <span className="car-card__dot">·</span>
          <span className="car-card__variant">{car.variant}</span>
        </div>
        <h3 className="car-card__title">
          <Link to={`/cars/${car.slug}`}>
            {car.year} {car.model}
          </Link>
        </h3>

        <div className="car-card__price-row">
          <strong className="car-card__price">{formatPKR(car.price)}</strong>
          <span className="car-card__emi">EMI from {formatPKR(estimateMonthly(car.price))}/mo</span>
        </div>

        <div className="car-card__specs">
          <span>
            <Calendar size={14} /> {car.year}
          </span>
          <span>
            <Gauge size={14} /> {formatMileage(car.mileage)}
          </span>
          <span>
            <Cog size={14} /> {car.transmission === 'Automatic' ? 'Auto' : 'Manual'}
          </span>
          <span>
            <Fuel size={14} /> {car.fuel}
          </span>
        </div>

        <div className="car-card__foot">
          <span className="car-card__location">
            <MapPin size={14} /> {car.city}
          </span>
          <div className="car-card__actions">
            <button
              type="button"
              className={cn('compare-btn', comparing && 'is-active')}
              onClick={() => toggleCompare(car.id)}
              aria-pressed={comparing}
            >
              <GitCompareArrows size={14} /> {comparing ? 'Added' : 'Compare'}
            </button>
            <Link to={`/cars/${car.slug}`} className="car-card__view">
              Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
