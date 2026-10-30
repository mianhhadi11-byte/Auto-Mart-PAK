import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, GitCompareArrows, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPKR } from '../utils/format';

export function CompareBar() {
  const { compare, allCars, removeCompare, clearCompare } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (compare.length === 0 || pathname === '/compare') return null;
  const selected = compare
    .map((id) => allCars.find((car) => car.id === id))
    .filter((car): car is NonNullable<typeof car> => Boolean(car));

  return (
    <div className="compare-bar">
      <div className="container compare-bar__inner">
        <div className="compare-bar__label">
          <span className="compare-bar__icon">
            <GitCompareArrows size={18} />
          </span>
          <span>
            <strong>{selected.length}</strong> {selected.length === 1 ? 'car' : 'cars'} selected
            <small>Compare up to 4 cars side by side</small>
          </span>
        </div>

        <div className="compare-bar__cars">
          {selected.map((car) => (
            <div className="compare-chip" key={car.id}>
              <img src={car.images[0]} alt="" />
              <span>
                {car.brand} {car.model}
                <small>{formatPKR(car.price)}</small>
              </span>
              <button
                type="button"
                onClick={() => removeCompare(car.id)}
                aria-label={`Remove ${car.brand} ${car.model} from comparison`}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="compare-bar__actions">
          <button type="button" className="compare-bar__clear" onClick={clearCompare}>
            Clear
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => navigate('/compare')}
            disabled={selected.length < 2}
            title={selected.length < 2 ? 'Select at least two cars to compare' : undefined}
          >
            Compare Now <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
