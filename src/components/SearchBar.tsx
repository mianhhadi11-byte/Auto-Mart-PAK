import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Tag, Car, Wallet } from 'lucide-react';
import { BRANDS, CITIES, PRICE_RANGES, YEARS, getBrandModels } from '../data/cars';

export function SearchBar() {
  const navigate = useNavigate();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');

  const models = brand ? getBrandModels(brand) : [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (model) params.set('model', model);
    if (city) params.set('city', city);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (year) params.set('year', year);
    navigate(`/buy${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="hero-search-wrap">
      <form className="hero-search" onSubmit={handleSubmit} role="search" aria-label="Search cars">
        <label className="search-field">
          <span className="search-field__label">
            <Car size={13} /> Brand
          </span>
          <select
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              setModel('');
            }}
          >
            <option value="">All Brands</option>
            {BRANDS.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span className="search-field__label">
            <Tag size={13} /> Model
          </span>
          <select value={model} onChange={(event) => setModel(event.target.value)} disabled={!brand}>
            <option value="">{brand ? 'All Models' : 'Select brand first'}</option>
            {models.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span className="search-field__label">
            <MapPin size={13} /> City
          </span>
          <select value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="">All Cities</option>
            {CITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span className="search-field__label">
            <Wallet size={13} /> Max Budget
          </span>
          <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}>
            <option value="">Any Budget</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.label} value={range.max}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label className="search-field">
          <span className="search-field__label">
            <Calendar size={13} /> Model Year
          </span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="">Any Year</option>
            {YEARS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn--primary hero-search__submit">
          <Search size={18} /> Search Cars
        </button>
      </form>

      <div className="search-quick">
        <span>Popular:</span>
        <button type="button" onClick={() => navigate('/buy?maxPrice=3000000')}>
          Under PKR 30 Lakh
        </button>
        <button type="button" onClick={() => navigate('/buy?bodyType=SUV')}>
          SUVs
        </button>
        <button type="button" onClick={() => navigate('/buy?transmission=Automatic')}>
          Automatic
        </button>
        <button type="button" onClick={() => navigate('/buy?fuel=Hybrid')}>
          Hybrid
        </button>
        <button type="button" onClick={() => navigate('/buy?brand=Honda&model=Civic')}>
          Honda Civic
        </button>
      </div>
    </div>
  );
}
