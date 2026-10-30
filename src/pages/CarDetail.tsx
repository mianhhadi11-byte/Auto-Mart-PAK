import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cog,
  Eye,
  Fuel,
  Gauge,
  GitCompareArrows,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CarCard } from '../components/CarCard';
import { SectionHeading } from '../components/SectionHeading';
import { NotFound } from './NotFound';
import type { Car } from '../types';
import {
  cn,
  estimateMonthly,
  formatDate,
  formatMileage,
  formatPKR,
  timeAgo,
} from '../utils/format';
import { minLength, required, validatePhone } from '../utils/validation';
import { CAR_PLACEHOLDER } from '../utils/placeholder';
import { useLockBody, usePageTitle } from '../hooks/usePageTitle';

const TABS = ['Overview', 'Specifications', 'Features'] as const;
type Tab = (typeof TABS)[number];

function WhatsAppLink({ car }: { car: Car }) {
  const phone = car.seller.phone.replace(/\D/g, '');
  const message = `Assalam o Alaikum, I am interested in your ${car.year} ${car.brand} ${car.model} ${car.variant} listed on AutoMart Pakistan (${formatPKR(car.price)}). Is it still available?`;
  return (
    <a
      className="btn btn--whatsapp btn--block"
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
    >
      <MessageCircle size={18} /> WhatsApp Seller
    </a>
  );
}

export function CarDetail() {
  const { slug } = useParams();
  const {
    allCars,
    isFavorite,
    toggleFavorite,
    isComparing,
    toggleCompare,
    addToast,
    saveMessage,
    user,
  } = useApp();
  const car = allCars.find((item) => item.slug === slug);

  usePageTitle(
    car ? `${car.year} ${car.brand} ${car.model} ${car.variant} for sale in ${car.city}` : 'Car not found',
    car ? `${car.year} ${car.brand} ${car.model} ${car.variant} for sale in ${car.city} for ${formatPKR(car.price)}. View photos, specifications and seller details.` : undefined,
  );

  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');
  const [revealed, setRevealed] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [tenure, setTenure] = useState(5);
  const [inquiry, setInquiry] = useState({ name: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useLockBody(lightbox || messageOpen);

  useEffect(() => {
    setImageIndex(0);
    setLightbox(false);
    setTab('Overview');
    setRevealed(false);
    setMessageOpen(false);
    setInquiry({ name: user?.name ?? '', phone: user?.phone ?? '', message: '' });
    setErrors({});
  }, [car?.id, user?.name, user?.phone]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
      const total = car?.images.length || 1;
      if (event.key === 'ArrowRight' && car) setImageIndex((index) => (index + 1) % total);
      if (event.key === 'ArrowLeft' && car) setImageIndex((index) => (index - 1 + total) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, car]);

  if (!car) return <NotFound />;

  const images = car.images.length > 0 ? car.images : [CAR_PLACEHOLDER];
  const favorite = isFavorite(car.id);
  const comparing = isComparing(car.id);
  const related = allCars
    .filter((item) => item.id !== car.id && (item.bodyType === car.bodyType || item.brand === car.brand))
    .slice(0, 3);

  const monthly = estimateMonthly(car.price, downPct / 100, tenure, 0.17);
  const downPayment = Math.round((car.price * downPct) / 100);
  const financed = car.price - downPayment;
  const totalPayable = monthly * tenure * 12 + downPayment;

  const prevImage = () => setImageIndex((index) => (index - 1 + images.length) % images.length);
  const nextImage = () => setImageIndex((index) => (index + 1) % images.length);

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      addToast('Listing link copied to your clipboard.');
    } catch {
      addToast(`Copy this link to share: ${url}`, 'info');
    }
  };

  const openMessage = () => {
    setInquiry({ name: user?.name ?? '', phone: user?.phone ?? '', message: '' });
    setErrors({});
    setMessageOpen(true);
  };

  const submitInquiry = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {
      name: required(inquiry.name, 'Your name'),
      phone: validatePhone(inquiry.phone),
      message: minLength(inquiry.message, 10, 'Message'),
    };
    const cleaned = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value));
    setErrors(cleaned);
    if (Object.keys(cleaned).length > 0) return;
    saveMessage({
      name: inquiry.name.trim(),
      email: user?.email ?? '',
      phone: inquiry.phone.trim(),
      subject: `Inquiry: ${car.year} ${car.brand} ${car.model} ${car.variant}`,
      message: inquiry.message.trim(),
    });
    setMessageOpen(false);
    addToast(`Your message has been sent to ${car.seller.name}.`);
  };

  const specs: Array<[string, string]> = [
    ['Make', car.brand],
    ['Model', car.model],
    ['Variant', car.variant],
    ['Model Year', String(car.year)],
    ['Registered In', car.registeredIn],
    ['Mileage', formatMileage(car.mileage)],
    ['Engine', `${car.engine} cc`],
    ['Transmission', car.transmission],
    ['Fuel Type', car.fuel],
    ['Fuel Average', `${car.fuelAverage} km/l`],
    ['Body Type', car.bodyType],
    ['Exterior Colour', car.color],
    ['Seating Capacity', `${car.seats} persons`],
    ['Condition', car.condition],
    ['Seller Type', car.seller.type],
    ['Listed On', formatDate(car.dateListed)],
  ];

  return (
    <div className="detail-page">
      <div className="container detail-breadcrumb">
        <nav className="breadcrumb breadcrumb--dark" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/buy">Buy Cars</Link>
          <ChevronRight size={13} />
          <Link to={`/buy?brand=${encodeURIComponent(car.brand)}`}>{car.brand}</Link>
          <ChevronRight size={13} />
          <span>{car.model}</span>
        </nav>
      </div>

      <div className="container detail-grid">
        <div className="detail-main">
          <section className="gallery" aria-label="Car photo gallery">
            <div className="gallery__main" onClick={() => setLightbox(true)}>
              <img src={images[imageIndex]} alt={`${car.year} ${car.brand} ${car.model} — photo ${imageIndex + 1}`} />
              <span className="gallery__counter">
                {imageIndex + 1} / {images.length}
              </span>
              <button type="button" className="gallery__expand" aria-label="View full screen">
                <Maximize2 size={17} />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="gallery__nav gallery__nav--prev"
                    onClick={(event) => {
                      event.stopPropagation();
                      prevImage();
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="gallery__nav gallery__nav--next"
                    onClick={(event) => {
                      event.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              <div className="gallery__badges">
                {car.featured && <span className="badge badge--gold">Featured</span>}
                {car.verified && (
                  <span className="badge badge--verified">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="gallery__thumbs">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={cn('gallery__thumb', index === imageIndex && 'is-active')}
                    onClick={() => setImageIndex(index)}
                    aria-label={`View photo ${index + 1}`}
                    aria-pressed={index === imageIndex}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="detail-title">
            <div className="detail-title__badges">
              {car.condition === 'Certified Pre-Owned' && <span className="badge badge--certified">Certified</span>}
              <span className="detail-title__listed">
                <Eye size={14} /> {car.views.toLocaleString('en-PK')} views · Listed {timeAgo(car.dateListed)}
              </span>
            </div>
            <h1>
              {car.year} {car.brand} {car.model}
            </h1>
            <p className="detail-title__variant">{car.variant}</p>

            <div className="detail-title__row">
              <div className="detail-price">
                <strong>{formatPKR(car.price)}</strong>
                <span>EMI from {formatPKR(estimateMonthly(car.price))}/month</span>
              </div>
              <div className="detail-actions">
                <button
                  type="button"
                  className={cn('detail-action', favorite && 'is-active')}
                  onClick={() => toggleFavorite(car.id)}
                  aria-pressed={favorite}
                >
                  <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
                  {favorite ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  className={cn('detail-action', comparing && 'is-active')}
                  onClick={() => toggleCompare(car.id)}
                  aria-pressed={comparing}
                >
                  <GitCompareArrows size={18} />
                  {comparing ? 'Comparing' : 'Compare'}
                </button>
                <button type="button" className="detail-action" onClick={share}>
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>

            <div className="detail-location">
              <span>
                <MapPin size={15} /> {car.city}
              </span>
              <span>
                <Calendar size={15} /> {car.year}
              </span>
              <span>
                <Gauge size={15} /> {formatMileage(car.mileage)}
              </span>
            </div>
          </section>

          <section className="detail-highlights" aria-label="Key specifications">
            <div className="highlight">
              <span className="highlight__icon"><Calendar size={19} /></span>
              <span><small>Model year</small><strong>{car.year}</strong></span>
            </div>
            <div className="highlight">
              <span className="highlight__icon"><Gauge size={19} /></span>
              <span><small>Mileage</small><strong>{formatMileage(car.mileage)}</strong></span>
            </div>
            <div className="highlight">
              <span className="highlight__icon"><Cog size={19} /></span>
              <span><small>Engine</small><strong>{car.engine} cc</strong></span>
            </div>
            <div className="highlight">
              <span className="highlight__icon"><Fuel size={19} /></span>
              <span><small>Fuel · Average</small><strong>{car.fuel} · {car.fuelAverage} km/l</strong></span>
            </div>
          </section>

          <div className="detail-tabs" role="tablist" aria-label="Car information">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                className={cn(tab === item && 'is-active')}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="detail-tab-content">
            {tab === 'Overview' && (
              <div className="detail-panel">
                <h2>About this car</h2>
                <p>{car.description}</p>
                <p>
                  The seller has provided the details above and welcomes a physical inspection. Verify the
                  chassis number, registration book and service history before finalising any purchase.
                </p>
                <div className="detail-overview-grid">
                  <div>
                    <h3>At a glance</h3>
                    <ul className="spec-list">
                      <li><span>Transmission</span><strong>{car.transmission}</strong></li>
                      <li><span>Fuel type</span><strong>{car.fuel}</strong></li>
                      <li><span>Body type</span><strong>{car.bodyType}</strong></li>
                      <li><span>Colour</span><strong>{car.color}</strong></li>
                      <li><span>Registered in</span><strong>{car.registeredIn}</strong></li>
                      <li><span>Seating</span><strong>{car.seats} persons</strong></li>
                    </ul>
                  </div>
                  <div>
                    <h3>Top features</h3>
                    <ul className="feature-list feature-list--compact">
                      {car.features.slice(0, 8).map((feature) => (
                        <li key={feature}><CheckCircle2 size={16} /> {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {tab === 'Specifications' && (
              <div className="detail-panel">
                <h2>Full specifications</h2>
                <div className="spec-table">
                  {specs.map(([label, value]) => (
                    <div className="spec-table__row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Features' && (
              <div className="detail-panel">
                <h2>Features & equipment</h2>
                <p>{car.model} {car.variant} comes with the following factory and aftermarket features.</p>
                <ul className="feature-list">
                  {car.features.map((feature) => (
                    <li key={feature}><CheckCircle2 size={17} /> {feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="seller-card">
            <div className="seller-card__head">
              <span className="avatar avatar--xl">{car.seller.name.charAt(0)}</span>
              <div>
                <span className="seller-card__type">{car.seller.type} seller</span>
                <h2>{car.seller.name}</h2>
                <div className="seller-card__rating">
                  <Star size={14} fill="currentColor" />
                  <strong>{car.seller.rating.toFixed(1)}</strong>
                  <span>· Member since {car.seller.memberSince}</span>
                </div>
              </div>
            </div>
            <div className="seller-card__meta">
              <span><MapPin size={14} /> {car.seller.city}</span>
              {car.verified && <span className="seller-card__verified"><ShieldCheck size={14} /> Verified</span>}
            </div>

            <div className="seller-card__price">
              <span>Asking price</span>
              <strong>{formatPKR(car.price)}</strong>
            </div>

            {revealed ? (
              <a href={`tel:${car.seller.phone.replace(/\s/g, '')}`} className="btn btn--primary btn--block btn--lg">
                <Phone size={18} /> {car.seller.phone}
              </a>
            ) : (
              <button type="button" className="btn btn--primary btn--block btn--lg" onClick={() => setRevealed(true)}>
                <Phone size={18} /> Show Phone Number
              </button>
            )}
            <WhatsAppLink car={car} />
            <button type="button" className="btn btn--ghost btn--block" onClick={openMessage}>
              <Send size={17} /> Message Seller
            </button>

            <div className="seller-card__safety">
              <ShieldCheck size={17} />
              <p>
                Meet in a public place, inspect the car thoroughly and never pay a deposit before
                seeing the vehicle.
              </p>
            </div>
          </div>

          <div className="emi-card">
            <div className="emi-card__head">
              <span className="emi-card__icon"><Calculator size={19} /></span>
              <div>
                <h3>Instalment calculator</h3>
                <p>Estimate your monthly payment</p>
              </div>
            </div>
            <div className="emi-result">
              <span>Estimated monthly</span>
              <strong>{formatPKR(monthly)}</strong>
              <small>at 17% p.a. for {tenure} years</small>
            </div>
            <label className="emi-field">
              <span>Down payment <strong>{downPct}% · {formatPKR(downPayment)}</strong></span>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPct}
                onChange={(event) => setDownPct(Number(event.target.value))}
              />
            </label>
            <label className="emi-field">
              <span>Tenure <strong>{tenure} years</strong></span>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={tenure}
                onChange={(event) => setTenure(Number(event.target.value))}
              />
            </label>
            <div className="emi-breakdown">
              <span>Financed amount <strong>{formatPKR(financed)}</strong></span>
              <span>Total payable <strong>{formatPKR(totalPayable)}</strong></span>
            </div>
            <p className="emi-disclaimer">Indicative only. Bank terms and approval criteria apply.</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section section--related">
          <div className="container">
            <SectionHeading
              eyebrow="You may also like"
              title="Related cars"
              description={`More ${car.bodyType.toLowerCase()}s and ${car.brand} listings from across Pakistan.`}
              link={{ to: '/buy', label: 'Browse all cars' }}
            />
            <div className="car-grid">
              {related.map((item) => (
                <CarCard key={item.id} car={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Car photo viewer">
          <button type="button" className="lightbox__close" onClick={() => setLightbox(false)} aria-label="Close photo viewer">
            <X size={24} />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={prevImage} aria-label="Previous photo">
            <ChevronLeft size={28} />
          </button>
          <img src={images[imageIndex]} alt={`${car.year} ${car.brand} ${car.model} full screen`} />
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={nextImage} aria-label="Next photo">
            <ChevronRight size={28} />
          </button>
          <span className="lightbox__counter">{imageIndex + 1} / {images.length}</span>
        </div>
      )}

      {messageOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
          <div className="modal__overlay" onClick={() => setMessageOpen(false)} />
          <div className="modal__panel">
            <div className="modal__head">
              <div>
                <span className="eyebrow">Contact seller</span>
                <h2 id="inquiry-title">Message {car.seller.name}</h2>
              </div>
              <button type="button" className="icon-btn" onClick={() => setMessageOpen(false)} aria-label="Close message form">
                <X size={20} />
              </button>
            </div>
            <p className="modal__intro">
              Ask about the {car.year} {car.brand} {car.model} {car.variant}. Your message is saved with the seller.
            </p>
            <form className="form" onSubmit={submitInquiry} noValidate>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="inquiry-name">Your name</label>
                  <input
                    id="inquiry-name"
                    value={inquiry.name}
                    onChange={(event) => setInquiry({ ...inquiry, name: event.target.value })}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="inquiry-phone">Phone number</label>
                  <input
                    id="inquiry-phone"
                    value={inquiry.phone}
                    onChange={(event) => setInquiry({ ...inquiry, phone: event.target.value })}
                    placeholder="0300 1234567"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="field">
                <label htmlFor="inquiry-message">Message</label>
                <textarea
                  id="inquiry-message"
                  rows={4}
                  value={inquiry.message}
                  onChange={(event) => setInquiry({ ...inquiry, message: event.target.value })}
                  placeholder="Assalam o Alaikum, is the car still available for inspection this week?"
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <span className="field-error">{errors.message}</span>}
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setMessageOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary">
                  <Send size={16} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container detail-back">
        <Link to="/buy" className="btn btn--ghost">
          <ArrowLeft size={16} /> Back to all cars
        </Link>
      </div>
    </div>
  );
}
