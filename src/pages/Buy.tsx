import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { CarCard } from '../components/CarCard';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import {
  BODY_TYPES,
  BRANDS,
  CITIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  YEARS,
  getBrandModels,
} from '../data/cars';
import type { CarFilters } from '../types';
import { cn } from '../utils/format';
import { useLockBody, usePageTitle } from '../hooks/usePageTitle';

const PAGE_SIZE = 9;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'mileage-low', label: 'Mileage: lowest first' },
  { value: 'year-new', label: 'Year: newest first' },
  { value: 'year-old', label: 'Year: oldest first' },
];

export function Buy() {
  usePageTitle(
    'Buy Cars in Pakistan',
    'Browse used and certified cars for sale across Pakistan. Filter by brand, model, city, budget, year, transmission and fuel type.',
  );
  const { allCars } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  useLockBody(filtersOpen);

  const filters: CarFilters = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      brand: searchParams.get('brand') ?? '',
      model: searchParams.get('model') ?? '',
      city: searchParams.get('city') ?? '',
      minPrice: searchParams.get('minPrice') ?? '',
      maxPrice: searchParams.get('maxPrice') ?? '',
      year: searchParams.get('year') ?? '',
      transmission: searchParams.get('transmission') ?? '',
      fuel: searchParams.get('fuel') ?? '',
      bodyType: searchParams.get('bodyType') ?? '',
      sort: searchParams.get('sort') ?? 'newest',
    }),
    [searchParams],
  );

  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const update = (key: keyof CarFilters | 'page', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const reset = () => {
    setSearchParams({}, { replace: true });
    setFiltersOpen(false);
  };

  const filtered = useMemo(() => {
    const query = filters.q.trim().toLowerCase();
    const min = filters.minPrice ? Number(filters.minPrice) : 0;
    const max = filters.maxPrice ? Number(filters.maxPrice) : Number.POSITIVE_INFINITY;
    const year = filters.year ? Number(filters.year) : 0;

    const result = allCars.filter((car) => {
      if (query) {
        const haystack = `${car.brand} ${car.model} ${car.variant} ${car.city} ${car.year} ${car.bodyType}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (filters.brand && car.brand !== filters.brand) return false;
      if (filters.model && car.model !== filters.model) return false;
      if (filters.city && car.city !== filters.city) return false;
      if (car.price < min || car.price > max) return false;
      if (year && car.year !== year) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      return true;
    });

    return result.sort((a, b) => {
      switch (filters.sort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'mileage-low':
          return a.mileage - b.mileage;
        case 'year-new':
          return b.year - a.year;
        case 'year-old':
          return a.year - b.year;
        default:
          return new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime();
      }
    });
  }, [allCars, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const activeFilters = [
    filters.q && { key: 'q' as const, label: `“${filters.q}”` },
    filters.brand && { key: 'brand' as const, label: filters.brand },
    filters.model && { key: 'model' as const, label: filters.model },
    filters.city && { key: 'city' as const, label: filters.city },
    filters.year && { key: 'year' as const, label: filters.year },
    filters.transmission && { key: 'transmission' as const, label: filters.transmission },
    filters.fuel && { key: 'fuel' as const, label: filters.fuel },
    filters.bodyType && { key: 'bodyType' as const, label: filters.bodyType },
    filters.minPrice && { key: 'minPrice' as const, label: `Min PKR ${Number(filters.minPrice).toLocaleString('en-PK')}` },
    filters.maxPrice && { key: 'maxPrice' as const, label: `Max PKR ${Number(filters.maxPrice).toLocaleString('en-PK')}` },
  ].filter(Boolean) as Array<{ key: keyof CarFilters; label: string }>;

  const models = filters.brand ? getBrandModels(filters.brand) : [];

  const goToPage = (nextPage: number) => {
    update('page', String(nextPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="buy-page">
      <PageHeader
        eyebrow="Browse the market"
        title="Buy Cars in Pakistan"
        description="Search verified listings from trusted dealers and private sellers — all prices in PKR."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Buy Cars' }]}
      />

      <section className="listing-section">
        <div className="container listing-layout">
          <aside className={cn('filters-panel', filtersOpen && 'is-open')} aria-label="Car filters">
            <div className="filters-panel__head">
              <h2>
                <SlidersHorizontal size={18} /> Filters
                {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
              </h2>
              <button type="button" className="filters-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={20} />
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-keyword">Keyword</label>
              <div className="input-with-icon">
                <Search size={16} />
                <input
                  id="filter-keyword"
                  type="search"
                  placeholder="e.g. Civic, Lahore, SUV"
                  value={filters.q}
                  onChange={(event) => update('q', event.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-brand">Brand</label>
              <select
                id="filter-brand"
                value={filters.brand}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value) next.set('brand', event.target.value);
                  else next.delete('brand');
                  next.delete('model');
                  next.delete('page');
                  setSearchParams(next, { replace: true });
                }}
              >
                <option value="">All brands</option>
                {BRANDS.map((brand) => (
                  <option key={brand.name} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-model">Model</label>
              <select
                id="filter-model"
                value={filters.model}
                onChange={(event) => update('model', event.target.value)}
                disabled={!filters.brand}
              >
                <option value="">{filters.brand ? 'All models' : 'Select a brand first'}</option>
                {models.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-city">City</label>
              <select
                id="filter-city"
                value={filters.city}
                onChange={(event) => update('city', event.target.value)}
              >
                <option value="">All cities</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Price range (PKR)</span>
              <div className="price-inputs">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  aria-label="Minimum price"
                  value={filters.minPrice}
                  min={0}
                  onChange={(event) => update('minPrice', event.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  aria-label="Maximum price"
                  value={filters.maxPrice}
                  min={0}
                  onChange={(event) => update('maxPrice', event.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-year">Model year</label>
              <select
                id="filter-year"
                value={filters.year}
                onChange={(event) => update('year', event.target.value)}
              >
                <option value="">Any year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-transmission">Transmission</label>
              <select
                id="filter-transmission"
                value={filters.transmission}
                onChange={(event) => update('transmission', event.target.value)}
              >
                <option value="">Any transmission</option>
                {TRANSMISSIONS.map((transmission) => (
                  <option key={transmission} value={transmission}>{transmission}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-fuel">Fuel type</label>
              <select
                id="filter-fuel"
                value={filters.fuel}
                onChange={(event) => update('fuel', event.target.value)}
              >
                <option value="">Any fuel type</option>
                {FUEL_TYPES.map((fuel) => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-body">Body type</label>
              <select
                id="filter-body"
                value={filters.bodyType}
                onChange={(event) => update('bodyType', event.target.value)}
              >
                <option value="">Any body type</option>
                {BODY_TYPES.map((body) => (
                  <option key={body} value={body}>{body}</option>
                ))}
              </select>
            </div>

            <div className="filters-panel__actions">
              <button type="button" className="btn btn--ghost" onClick={reset}>
                Reset filters
              </button>
              <button type="button" className="btn btn--primary filters-apply" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} cars
              </button>
            </div>
          </aside>

          {filtersOpen && <div className="filters-overlay" onClick={() => setFiltersOpen(false)} />}

          <div className="listing-results">
            <div className="results-bar">
              <div className="results-bar__count">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? 'car' : 'cars'} found
                {filtered.length > 0 && (
                  <span>
                    Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
                  </span>
                )}
              </div>

              <div className="results-bar__actions">
                <button type="button" className="filters-toggle" onClick={() => setFiltersOpen(true)}>
                  <Filter size={16} /> Filters
                  {activeFilters.length > 0 && <span>{activeFilters.length}</span>}
                </button>

                <label className="sort-select">
                  <span>Sort by</span>
                  <select value={filters.sort} onChange={(event) => update('sort', event.target.value)}>
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <div className="view-toggle" role="group" aria-label="Change layout">
                  <button
                    type="button"
                    className={cn(view === 'grid' && 'is-active')}
                    onClick={() => setView('grid')}
                    aria-label="Grid view"
                    aria-pressed={view === 'grid'}
                  >
                    <LayoutGrid size={17} />
                  </button>
                  <button
                    type="button"
                    className={cn(view === 'list' && 'is-active')}
                    onClick={() => setView('list')}
                    aria-label="List view"
                    aria-pressed={view === 'list'}
                  >
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map((filter) => (
                  <button
                    key={`${filter.key}-${filter.label}`}
                    type="button"
                    className="filter-chip"
                    onClick={() => update(filter.key, '')}
                  >
                    {filter.label} <X size={13} />
                  </button>
                ))}
                <button type="button" className="filter-chip filter-chip--clear" onClick={reset}>
                  Clear all
                </button>
              </div>
            )}

            {visible.length > 0 ? (
              <div className={cn(view === 'grid' ? 'car-grid car-grid--results' : 'car-list')}>
                {visible.map((car) => (
                  <CarCard key={car.id} car={car} view={view} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search size={30} />}
                title="No cars match your filters"
                description="Try widening your budget, choosing another city, or clearing a filter or two."
              >
                <button type="button" className="btn btn--primary" onClick={reset}>
                  Clear all filters
                </button>
              </EmptyState>
            )}

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Listing pages">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={cn(pageNumber === currentPage && 'is-active')}
                    onClick={() => goToPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}

            <div className="listing-help">
              <div>
                <h3>Can&apos;t find the right car?</h3>
                <p>Save your search and we&apos;ll help you track new listings that match.</p>
              </div>
              <Link to="/contact" className="btn btn--ghost">Talk to our team</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
