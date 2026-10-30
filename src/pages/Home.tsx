import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Car,
  CheckCircle2,
  GitCompareArrows,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { SectionHeading } from '../components/SectionHeading';
import { CarCard } from '../components/CarCard';
import { useApp } from '../context/AppContext';
import { BRANDS, CITIES, brandCount, brandStartingPrice } from '../data/cars';
import { formatPriceShort } from '../utils/format';
import { usePageTitle } from '../hooks/usePageTitle';

const testimonials = [
  {
    name: 'Ayesha Khan',
    city: 'Karachi',
    role: 'Bought a Honda City',
    quote:
      'I compared three City variants side by side, checked the mileage and contacted the seller the same evening. The whole process felt genuinely premium.',
    initials: 'AK',
  },
  {
    name: 'Bilal Ahmed',
    city: 'Lahore',
    role: 'Sold a Suzuki Alto',
    quote:
      'Listed my Alto on a Friday and had three serious buyers by Sunday. The listing form was simple and the photos looked great on mobile.',
    initials: 'BA',
  },
  {
    name: 'Sana Malik',
    city: 'Islamabad',
    role: 'Bought a Haval H6',
    quote:
      'The verified badge and seller ratings gave me confidence before travelling to see the car. AutoMart is now my first stop for anything automotive.',
    initials: 'SM',
  },
];

const bodyTypes = [
  { name: 'Hatchback', icon: Car, copy: 'City-friendly and economical' },
  { name: 'Sedan', icon: Car, copy: 'Comfort for the whole family' },
  { name: 'SUV', icon: Car, copy: 'Space, power and presence' },
] as const;

export function Home() {
  usePageTitle(
    'Buy & Sell Cars in Pakistan',
    'Explore verified used cars for sale across Pakistan. Compare prices, specifications and contact trusted sellers on AutoMart Pakistan.',
  );
  const { allCars } = useApp();
  const featured = allCars.filter((car) => car.featured).slice(0, 6);
  const latest = [...allCars]
    .sort((a, b) => new Date(b.dateListed).getTime() - new Date(a.dateListed).getTime())
    .slice(0, 6);
  const heroCar = allCars.find((car) => car.slug.includes('civic-oriel')) ?? allCars[0];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__bg">
          <img src="/images/cars/hero-hunza.webp" alt="Scenic mountain landscape in Hunza Valley, Pakistan" />
        </div>
        <div className="hero__overlay" />
        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__eyebrow">
              <BadgeCheck size={15} /> Pakistan&apos;s premium car marketplace
            </span>
            <h1>
              Find Your <span>Perfect Car</span> in Pakistan
            </h1>
            <p className="hero__subtitle">
              Explore, Compare and Discover the Best Cars in Pakistan.
            </p>
            <div className="hero__stats">
              <div>
                <strong>{allCars.length}+</strong>
                <span>Curated listings</span>
              </div>
              <div>
                <strong>{CITIES.length}</strong>
                <span>Cities covered</span>
              </div>
              <div>
                <strong>{BRANDS.length}</strong>
                <span>Trusted brands</span>
              </div>
            </div>
            <div className="hero__assurance">
              <span>
                <ShieldCheck size={15} /> Verified sellers
              </span>
              <span>
                <CheckCircle2 size={15} /> Transparent pricing
              </span>
              <span>
                <GitCompareArrows size={15} /> Free comparison
              </span>
            </div>
          </div>

          {heroCar && (
            <div className="hero__visual">
              <div className="hero-car-card">
                <div className="hero-car-card__media">
                  <img
                    src={heroCar.images[0]}
                    alt={`${heroCar.year} ${heroCar.brand} ${heroCar.model}`}
                  />
                  <span className="hero-car-card__tag">
                    <Sparkles size={12} /> Featured this week
                  </span>
                </div>
                <div className="hero-car-card__body">
                  <span className="hero-car-card__brand">{heroCar.brand} · {heroCar.year}</span>
                  <h3>{heroCar.model} {heroCar.variant}</h3>
                  <div className="hero-car-card__meta">
                    <span>{heroCar.mileage.toLocaleString('en-PK')} km</span>
                    <span>{heroCar.transmission}</span>
                    <span>{heroCar.fuel}</span>
                  </div>
                  <div className="hero-car-card__foot">
                    <strong>PKR {heroCar.price.toLocaleString('en-PK')}</strong>
                    <Link to={`/cars/${heroCar.slug}`} aria-label="View featured car">
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="hero-float hero-float--verified">
                <span className="hero-float__icon">
                  <ShieldCheck size={17} />
                </span>
                <span>
                  <strong>Verified listings</strong>
                  <small>Checked seller details</small>
                </span>
              </div>
              <div className="hero-float hero-float--rating">
                <span className="hero-float__icon hero-float__icon--gold">
                  <Star size={17} fill="currentColor" />
                </span>
                <span>
                  <strong>4.9 / 5</strong>
                  <small>2,400+ happy buyers</small>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="container hero__search-container">
          <SearchBar />
        </div>
      </section>

      <section className="section section--featured">
        <div className="container">
          <SectionHeading
            eyebrow="Hand-picked for you"
            title="Featured cars in Pakistan"
            description="A closer look at the listings our team and buyers are watching this week."
            link={{ to: '/buy', label: 'View all cars' }}
          />
          <div className="car-grid">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--brands">
        <div className="container">
          <SectionHeading
            eyebrow="Browse by brand"
            title="Popular brands in Pakistan"
            description="From everyday hatchbacks to premium SUVs — find the badge that fits your drive."
            link={{ to: '/buy', label: 'Explore all brands' }}
          />
          <div className="brand-grid">
            {BRANDS.map((brand) => (
              <Link key={brand.name} to={`/buy?brand=${encodeURIComponent(brand.name)}`} className="brand-card">
                <div className="brand-card__top">
                  <span className="brand-card__mark">{brand.name.charAt(0)}</span>
                  <ArrowUpRight size={18} className="brand-card__arrow" />
                </div>
                <h3>{brand.name}</h3>
                <p>{brand.tagline}</p>
                <div className="brand-card__meta">
                  <span>{brandCount(brand.name)} listings</span>
                  <span>From {formatPriceShort(brandStartingPrice(brand.name))}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="bodytype-grid">
            {bodyTypes.map((type) => {
              const count = allCars.filter((car) => car.bodyType === type.name).length;
              return (
                <Link key={type.name} to={`/buy?bodyType=${type.name}`} className="bodytype-card">
                  <span className="bodytype-card__icon">
                    <type.icon size={22} />
                  </span>
                  <span>
                    <strong>{type.name}</strong>
                    <small>
                      {type.copy} · {count} {count === 1 ? 'listing' : 'listings'}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--latest">
        <div className="container">
          <SectionHeading
            eyebrow="Fresh on AutoMart"
            title="Latest car listings"
            description="Newly added cars from verified dealers and private sellers across Pakistan."
            link={{ to: '/buy?sort=newest', label: 'Browse latest' }}
          />
          <div className="car-grid">
            {latest.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--why">
        <div className="container why-grid">
          <div className="why-visual">
            <img src="/images/cars/about-market.webp" alt="Cars displayed at a Pakistani auto market" />
            <div className="why-stat">
              <span className="why-stat__icon">
                <TrendingUp size={20} />
              </span>
              <div>
                <strong>Save weeks of searching</strong>
                <small>Filter, compare and shortlist in one place.</small>
              </div>
            </div>
            <div className="why-stat why-stat--bottom">
              <span className="why-stat__icon why-stat__icon--gold">
                <Star size={20} fill="currentColor" />
              </span>
              <div>
                <strong>4.9 average seller rating</strong>
                <small>Real feedback from real buyers.</small>
              </div>
            </div>
          </div>

          <div className="why-content">
            <span className="eyebrow">Why AutoMart Pakistan</span>
            <h2>Buying a car should feel exciting, not exhausting.</h2>
            <p className="why-lead">
              We bring Pakistan&apos;s most trusted dealerships and genuine private sellers into one
              polished marketplace — with the tools you need to decide with confidence.
            </p>
            <div className="why-features">
              <div className="why-feature">
                <span className="why-feature__icon">
                  <ShieldCheck size={20} />
                </span>
                <h3>Verified listings</h3>
                <p>Seller identity and car details are checked before a listing goes live.</p>
              </div>
              <div className="why-feature">
                <span className="why-feature__icon">
                  <Wallet size={20} />
                </span>
                <h3>Transparent pricing</h3>
                <p>Real market prices in PKR, with an instant monthly instalment estimate.</p>
              </div>
              <div className="why-feature">
                <span className="why-feature__icon">
                  <Handshake size={20} />
                </span>
                <h3>Trusted sellers</h3>
                <p>Ratings, response history and dealership credentials at a glance.</p>
              </div>
              <div className="why-feature">
                <span className="why-feature__icon">
                  <GitCompareArrows size={20} />
                </span>
                <h3>Smart comparison</h3>
                <p>Compare up to four cars on price, mileage, engine and features.</p>
              </div>
            </div>
            <Link to="/about" className="btn btn--dark">
              Learn more about us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--how" id="how-it-works">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to your next car"
            description="No showroom queues, no guesswork. Just a smarter way to buy and sell."
            align="center"
          />
          <div className="steps">
            <div className="step">
              <span className="step__number">01</span>
              <span className="step__icon">
                <Search size={22} />
              </span>
              <h3>Search & filter</h3>
              <p>Tell us your budget, city and preferred brand. We narrow the market down for you.</p>
            </div>
            <div className="step">
              <span className="step__number">02</span>
              <span className="step__icon">
                <GitCompareArrows size={22} />
              </span>
              <h3>Compare & shortlist</h3>
              <p>Put your favourites side by side and see exactly what each car offers.</p>
            </div>
            <div className="step">
              <span className="step__number">03</span>
              <span className="step__icon">
                <Handshake size={22} />
              </span>
              <h3>Contact & buy</h3>
              <p>Reveal the seller&apos;s number, ask questions and arrange an inspection near you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--testimonials">
        <div className="container">
          <SectionHeading
            eyebrow="Customer stories"
            title="Trusted by buyers and sellers"
            description="Thousands of Pakistanis have found their next car through AutoMart."
            align="center"
          />
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="testimonial">
                <div className="testimonial__stars" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <div className="testimonial__author">
                  <span className="avatar avatar--lg">{testimonial.initials}</span>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>
                      {testimonial.role} · {testimonial.city}
                    </span>
                  </div>
                  <BadgeCheck size={18} className="testimonial__verified" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cta">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner__content">
              <span className="eyebrow eyebrow--light">Sell with confidence</span>
              <h2>Have a car to sell? Reach thousands of buyers.</h2>
              <p>
                Create a polished listing in minutes, add photos and connect with serious buyers
                across Pakistan — completely free.
              </p>
              <div className="cta-banner__actions">
                <Link to="/sell" className="btn btn--primary btn--lg">
                  Sell Your Car <ArrowRight size={18} />
                </Link>
                <Link to="/buy" className="btn btn--outline-light btn--lg">
                  Browse Cars
                </Link>
              </div>
            </div>
            <div className="cta-banner__stats">
              <div>
                <strong>Free</strong>
                <span>Basic listings</span>
              </div>
              <div>
                <strong>{CITIES.length}</strong>
                <span>Cities covered</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>Seller rating</span>
              </div>
            </div>
            <div className="cta-banner__glow" />
          </div>
        </div>
      </section>

      <section className="section section--map-note">
        <div className="container map-note">
          <div className="map-note__icon">
            <MapPin size={22} />
          </div>
          <div>
            <h3>Available across Pakistan</h3>
            <p>
              Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta and more.
            </p>
          </div>
          <Link to="/buy" className="btn btn--ghost">
            Find cars near you <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
