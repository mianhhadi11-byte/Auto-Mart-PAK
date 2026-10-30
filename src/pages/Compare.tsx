import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  GitCompareArrows,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import type { Car } from '../types';
import { cn, formatMileage, formatPKR } from '../utils/format';
import { usePageTitle } from '../hooks/usePageTitle';

const COMPARE_ROWS: Array<{
  label: string;
  get: (car: Car) => string;
  best?: 'min' | 'max';
  numeric?: (car: Car) => number;
}> = [
  { label: 'Price', get: (car) => formatPKR(car.price), best: 'min', numeric: (car) => car.price },
  { label: 'Model year', get: (car) => String(car.year), best: 'max', numeric: (car) => car.year },
  { label: 'Mileage', get: (car) => formatMileage(car.mileage), best: 'min', numeric: (car) => car.mileage },
  { label: 'Engine capacity', get: (car) => `${car.engine} cc` },
  { label: 'Fuel average', get: (car) => `${car.fuelAverage} km/l`, best: 'max', numeric: (car) => car.fuelAverage },
  { label: 'Transmission', get: (car) => car.transmission },
  { label: 'Fuel type', get: (car) => car.fuel },
  { label: 'Body type', get: (car) => car.bodyType },
  { label: 'Seating capacity', get: (car) => `${car.seats} persons` },
  { label: 'City', get: (car) => car.city },
  { label: 'Seller type', get: (car) => car.seller.type },
  { label: 'Condition', get: (car) => car.condition },
];

function CompareCarCard({ car, onRemove }: { car: Car; onRemove: () => void }) {
  return (
    <div className="compare-car">
      <Link to={`/cars/${car.slug}`} className="compare-car__media">
        <img src={car.images[0]} alt={`${car.year} ${car.brand} ${car.model}`} />
      </Link>
      <button type="button" className="compare-car__remove" onClick={onRemove} aria-label={`Remove ${car.brand} ${car.model}`}>
        <X size={15} />
      </button>
      <Link to={`/cars/${car.slug}`} className="compare-car__name">
        <strong>{car.year} {car.brand} {car.model}</strong>
        <span>{car.variant}</span>
      </Link>
      <strong className="compare-car__price">{formatPKR(car.price)}</strong>
    </div>
  );
}

export function Compare() {
  usePageTitle(
    'Compare Cars in Pakistan',
    'Compare up to four cars side by side — prices, engine capacity, fuel average, mileage, transmission, features and model year.',
  );
  const { allCars, compare, toggleCompare, removeCompare, clearCompare } = useApp();
  const [addId, setAddId] = useState('');

  const selected = compare
    .map((id) => allCars.find((car) => car.id === id))
    .filter((car): car is Car => Boolean(car));
  const available = allCars.filter((car) => !compare.includes(car.id));
  const suggestions = allCars.filter((car) => car.featured).slice(0, 4);

  const bestValue = (row: (typeof COMPARE_ROWS)[number]) => {
    if (!row.best || !row.numeric || selected.length < 2) return null;
    const values = selected.map(row.numeric);
    return row.best === 'min' ? Math.min(...values) : Math.max(...values);
  };

  const addCar = () => {
    if (!addId) return;
    toggleCompare(addId);
    setAddId('');
  };

  return (
    <div className="compare-page">
      <PageHeader
        eyebrow="Make the right call"
        title="Compare Cars Side by Side"
        description="Put price, performance, running costs and features next to each other before you decide."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Compare Cars' }]}
      >
        <div className="page-header__stats">
          <span><GitCompareArrows size={16} /> {selected.length} of 4 cars selected</span>
          <span><CheckCircle2 size={16} /> Free to use, no account needed</span>
        </div>
      </PageHeader>

      <section className="section compare-section">
        <div className="container">
          {selected.length === 0 ? (
            <>
              <EmptyState
                icon={<GitCompareArrows size={30} />}
                title="Nothing to compare yet"
                description="Add two or more cars from any listing and we'll line up their prices, specifications and features for you."
                action={{ to: '/buy', label: 'Browse cars to compare' }}
              />
              <div className="compare-suggest">
                <h2>Popular cars to start with</h2>
                <div className="compare-suggest__grid">
                  {suggestions.map((car) => (
                    <article className="compare-mini" key={car.id}>
                      <img src={car.images[0]} alt={`${car.brand} ${car.model}`} />
                      <div>
                        <strong>{car.year} {car.brand} {car.model}</strong>
                        <span>{car.variant} · {formatPKR(car.price)}</span>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => toggleCompare(car.id)}>
                          <Plus size={14} /> Add to compare
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="compare-toolbar">
                <div>
                  <h2>{selected.length} {selected.length === 1 ? 'car' : 'cars'} selected</h2>
                  <p>{selected.length < 2 ? 'Add at least one more car to see the comparison.' : 'Best values are highlighted in blue.'}</p>
                </div>
                <div className="compare-toolbar__actions">
                  {selected.length < 4 && (
                    <div className="compare-add">
                      <select value={addId} onChange={(event) => setAddId(event.target.value)} aria-label="Choose a car to add">
                        <option value="">Add another car…</option>
                        {available.map((car) => (
                          <option key={car.id} value={car.id}>
                            {car.year} {car.brand} {car.model} {car.variant} — {formatPKR(car.price)}
                          </option>
                        ))}
                      </select>
                      <button type="button" className="btn btn--primary btn--sm" onClick={addCar} disabled={!addId}>
                        <Plus size={15} /> Add
                      </button>
                    </div>
                  )}
                  <button type="button" className="btn btn--ghost btn--sm compare-clear" onClick={clearCompare}>
                    <Trash2 size={15} /> Clear all
                  </button>
                </div>
              </div>

              {selected.length === 1 && (
                <div className="compare-notice">
                  <GitCompareArrows size={18} />
                  <span>Pick a second car above, or add one from any listing card, to unlock the full comparison.</span>
                </div>
              )}

              <div className="compare-scroll">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="compare-table__label">
                        <span>Specification</span>
                      </th>
                      {selected.map((car) => (
                        <th key={car.id}>
                          <CompareCarCard car={car} onRemove={() => removeCompare(car.id)} />
                        </th>
                      ))}
                      {selected.length < 4 && (
                        <th className="compare-table__add">
                          <div className="compare-add-slot">
                            <Plus size={20} />
                            <span>Add another car</span>
                            <select value={addId} onChange={(event) => setAddId(event.target.value)} aria-label="Choose a car to add">
                              <option value="">Select car…</option>
                              {available.map((car) => (
                                <option key={car.id} value={car.id}>
                                  {car.year} {car.brand} {car.model}
                                </option>
                              ))}
                            </select>
                            <button type="button" className="btn btn--primary btn--sm" onClick={addCar} disabled={!addId}>
                              Add
                            </button>
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => {
                      const best = bestValue(row);
                      return (
                        <tr key={row.label}>
                          <th className="compare-table__label">{row.label}</th>
                          {selected.map((car) => {
                            const value = row.numeric?.(car);
                            const isBest = best !== null && value === best;
                            return (
                              <td key={car.id} className={cn(isBest && 'is-best')}>
                                {row.get(car)}
                                {isBest && <span className="best-tag">Best</span>}
                              </td>
                            );
                          })}
                          {selected.length < 4 && <td className="compare-table__empty">—</td>}
                        </tr>
                      );
                    })}
                    <tr>
                      <th className="compare-table__label">Features</th>
                      {selected.map((car) => (
                        <td key={car.id}>
                          <ul className="compare-features">
                            {car.features.slice(0, 6).map((feature) => (
                              <li key={feature}><CheckCircle2 size={13} /> {feature}</li>
                            ))}
                          </ul>
                          {car.features.length > 6 && (
                            <span className="compare-more">+{car.features.length - 6} more features</span>
                          )}
                        </td>
                      ))}
                      {selected.length < 4 && <td className="compare-table__empty">—</td>}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="compare-foot">
                <p>
                  Prices are set by sellers and may change. Always inspect the car and verify documents
                  before making a payment.
                </p>
                <Link to="/buy" className="btn btn--ghost">Keep browsing cars</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
