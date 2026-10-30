import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ImagePlus,
  Info,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import {
  BODY_TYPES,
  BRANDS,
  CITIES,
  FUEL_TYPES,
  TRANSMISSIONS,
  getBrandModels,
} from '../data/cars';
import type { BodyType, FuelType, SellerType, Transmission } from '../types';
import { formatPKR } from '../utils/format';
import {
  minLength,
  required,
  validateEmail,
  validateMileage,
  validatePhone,
  validatePrice,
  validateYear,
} from '../utils/validation';
import { usePageTitle } from '../hooks/usePageTitle';

const SELL_YEARS = Array.from({ length: 27 }, (_, index) => 2026 - index);

const FEATURE_OPTIONS = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'Alloy Wheels', 'Sunroof',
  'Leather Seats', 'Touchscreen Display', 'Rear Parking Camera', 'Cruise Control',
  'Keyless Entry', 'Push Button Start', 'ABS with EBD', 'Airbags', 'Fog Lamps',
  'Automatic Climate Control', 'Heated Seats',
];

const MAX_PHOTOS = 4;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('This image could not be loaded.'));
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image processing is not supported in this browser.'));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function Sell() {
  usePageTitle(
    'Sell Your Car in Pakistan',
    'List your car for sale on AutoMart Pakistan for free. Add photos, set your price and connect with verified buyers across the country.',
  );
  const { addCar, addToast, user } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand: '',
    model: '',
    variant: '',
    year: '',
    city: '',
    price: '',
    mileage: '',
    transmission: '' as Transmission | '',
    fuel: '' as FuelType | '',
    engine: '',
    fuelAverage: '',
    bodyType: '' as BodyType | '',
    color: '',
    registeredIn: '',
    seats: '5',
    description: '',
    sellerType: 'Private' as SellerType,
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    terms: false,
  });
  const [features, setFeatures] = useState<string[]>([
    'Air Conditioning',
    'Power Steering',
    'Power Windows',
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const models = form.brand ? getBrandModels(form.brand) : [];
  const priceNumber = Number(form.price);
  const previewImage = photos[0];

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    setPhotoError('');
    const list = Array.from(files);
    if (photos.length + list.length > MAX_PHOTOS) {
      setPhotoError(`You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const accepted: string[] = [];
    for (const file of list) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only JPG, PNG or WebP images are allowed.');
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        setPhotoError('Each photo must be smaller than 8 MB.');
        continue;
      }
      try {
        accepted.push(await compressImage(file));
      } catch (error) {
        setPhotoError(error instanceof Error ? error.message : 'Could not process this photo.');
      }
    }
    setPhotos((current) => [...current, ...accepted].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index));
  };

  const toggleFeature = (feature: string) => {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature],
    );
  };

  const validate = () => {
    const next: Record<string, string> = {
      brand: required(form.brand, 'Brand'),
      model: required(form.model, 'Model'),
      year: validateYear(Number(form.year)),
      city: required(form.city, 'City'),
      price: validatePrice(Number(form.price)),
      mileage: validateMileage(Number(form.mileage)),
      transmission: required(form.transmission, 'Transmission'),
      fuel: required(form.fuel, 'Fuel type'),
      engine: required(form.engine, 'Engine capacity'),
      fuelAverage: required(form.fuelAverage, 'Fuel average'),
      bodyType: required(form.bodyType, 'Body type'),
      color: required(form.color, 'Colour'),
      registeredIn: required(form.registeredIn, 'Registration city'),
      description: minLength(form.description, 30, 'Description'),
      name: required(form.name, 'Your name'),
      phone: validatePhone(form.phone),
      email: form.email ? validateEmail(form.email) : '',
    };
    if (!form.year) next.year = 'Model year is required.';
    if (!form.price) next.price = 'Asking price is required.';
    if (!form.mileage) next.mileage = 'Mileage is required.';
    if (Number(form.engine) < 500 || Number(form.engine) > 8000) {
      next.engine = 'Enter an engine capacity between 500 and 8000 cc.';
    }
    if (Number(form.fuelAverage) <= 0 || Number(form.fuelAverage) > 60) {
      next.fuelAverage = 'Enter a realistic fuel average between 1 and 60 km/l.';
    }
    if (!form.terms) next.terms = 'Please confirm the information is accurate.';
    return Object.fromEntries(Object.entries(next).filter(([, value]) => value));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      document.getElementById(`sell-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      addToast('Please fix the highlighted fields before submitting.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const car = addCar({
        brand: form.brand,
        model: form.model,
        variant: form.variant.trim() || 'Standard',
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        city: form.city,
        transmission: form.transmission as Transmission,
        fuel: form.fuel as FuelType,
        engine: Number(form.engine),
        fuelAverage: Number(form.fuelAverage),
        bodyType: form.bodyType as BodyType,
        color: form.color.trim(),
        seats: Number(form.seats),
        registeredIn: form.registeredIn,
        condition: 'Used',
        features,
        description: form.description.trim(),
        images: photos,
        seller: {
          name: form.name.trim(),
          type: form.sellerType,
          phone: form.phone.trim(),
          rating: 5,
          memberSince: String(new Date().getFullYear()),
          city: form.city,
        },
        ownerEmail: user?.email,
      });
      addToast('Your car is now live on AutoMart Pakistan!');
      navigate(`/cars/${car.slug}`);
    } catch {
      addToast('Something went wrong while saving your listing. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  const priceLabel = useMemo(
    () => (Number.isFinite(priceNumber) && priceNumber > 0 ? formatPKR(priceNumber) : 'PKR —'),
    [priceNumber],
  );

  return (
    <div className="sell-page">
      <PageHeader
        eyebrow="List in minutes"
        title="Sell Your Car in Pakistan"
        description="Create a free, professional listing and put your car in front of thousands of serious buyers."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Sell Your Car' }]}
      >
        <div className="page-header__stats">
          <span><BadgeCheck size={16} /> Free basic listing</span>
          <span><Users size={16} /> Buyers in 12 cities</span>
          <span><ShieldCheck size={16} /> Secure contact</span>
        </div>
      </PageHeader>

      <section className="section sell-section">
        <div className="container sell-layout">
          <form className="sell-form" onSubmit={handleSubmit} noValidate>
            <section className="form-section">
              <div className="form-section__head">
                <span className="form-section__number">01</span>
                <div>
                  <h2>Car details</h2>
                  <p>Tell buyers exactly what you&apos;re selling.</p>
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="sell-brand">Brand *</label>
                  <select
                    id="sell-brand"
                    value={form.brand}
                    onChange={(event) => {
                      update('brand', event.target.value);
                      setForm((current) => ({ ...current, brand: event.target.value, model: '' }));
                    }}
                    aria-invalid={Boolean(errors.brand)}
                  >
                    <option value="">Select brand</option>
                    {BRANDS.map((brand) => (
                      <option key={brand.name} value={brand.name}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brand && <span className="field-error">{errors.brand}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-model">Model *</label>
                  <select
                    id="sell-model"
                    value={form.model}
                    onChange={(event) => update('model', event.target.value)}
                    disabled={!form.brand}
                    aria-invalid={Boolean(errors.model)}
                  >
                    <option value="">{form.brand ? 'Select model' : 'Select a brand first'}</option>
                    {models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  {errors.model && <span className="field-error">{errors.model}</span>}
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="field">
                  <label htmlFor="sell-variant">Variant</label>
                  <input
                    id="sell-variant"
                    value={form.variant}
                    onChange={(event) => update('variant', event.target.value)}
                    placeholder="e.g. VXL AGS"
                  />
                </div>
                <div className="field">
                  <label htmlFor="sell-year">Model year *</label>
                  <select
                    id="sell-year"
                    value={form.year}
                    onChange={(event) => update('year', event.target.value)}
                    aria-invalid={Boolean(errors.year)}
                  >
                    <option value="">Select year</option>
                    {SELL_YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.year && <span className="field-error">{errors.year}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-city">City *</label>
                  <select
                    id="sell-city"
                    value={form.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="field">
                  <label htmlFor="sell-price">Asking price (PKR) *</label>
                  <div className="input-prefix">
                    <span>PKR</span>
                    <input
                      id="sell-price"
                      type="number"
                      inputMode="numeric"
                      value={form.price}
                      onChange={(event) => update('price', event.target.value)}
                      placeholder="3250000"
                      aria-invalid={Boolean(errors.price)}
                    />
                  </div>
                  {errors.price && <span className="field-error">{errors.price}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-mileage">Mileage (km) *</label>
                  <div className="input-suffix">
                    <input
                      id="sell-mileage"
                      type="number"
                      inputMode="numeric"
                      value={form.mileage}
                      onChange={(event) => update('mileage', event.target.value)}
                      placeholder="42000"
                      aria-invalid={Boolean(errors.mileage)}
                    />
                    <span>km</span>
                  </div>
                  {errors.mileage && <span className="field-error">{errors.mileage}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-registered">Registered in *</label>
                  <select
                    id="sell-registered"
                    value={form.registeredIn}
                    onChange={(event) => update('registeredIn', event.target.value)}
                    aria-invalid={Boolean(errors.registeredIn)}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {errors.registeredIn && <span className="field-error">{errors.registeredIn}</span>}
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="field">
                  <label htmlFor="sell-transmission">Transmission *</label>
                  <select
                    id="sell-transmission"
                    value={form.transmission}
                    onChange={(event) => update('transmission', event.target.value)}
                    aria-invalid={Boolean(errors.transmission)}
                  >
                    <option value="">Select transmission</option>
                    {TRANSMISSIONS.map((transmission) => (
                      <option key={transmission} value={transmission}>{transmission}</option>
                    ))}
                  </select>
                  {errors.transmission && <span className="field-error">{errors.transmission}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-fuel">Fuel type *</label>
                  <select
                    id="sell-fuel"
                    value={form.fuel}
                    onChange={(event) => update('fuel', event.target.value)}
                    aria-invalid={Boolean(errors.fuel)}
                  >
                    <option value="">Select fuel type</option>
                    {FUEL_TYPES.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                  {errors.fuel && <span className="field-error">{errors.fuel}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-body">Body type *</label>
                  <select
                    id="sell-body"
                    value={form.bodyType}
                    onChange={(event) => update('bodyType', event.target.value)}
                    aria-invalid={Boolean(errors.bodyType)}
                  >
                    <option value="">Select body type</option>
                    {BODY_TYPES.map((body) => (
                      <option key={body} value={body}>{body}</option>
                    ))}
                  </select>
                  {errors.bodyType && <span className="field-error">{errors.bodyType}</span>}
                </div>
              </div>

              <div className="form-row form-row--4">
                <div className="field">
                  <label htmlFor="sell-engine">Engine (cc) *</label>
                  <input
                    id="sell-engine"
                    type="number"
                    inputMode="numeric"
                    value={form.engine}
                    onChange={(event) => update('engine', event.target.value)}
                    placeholder="1197"
                    aria-invalid={Boolean(errors.engine)}
                  />
                  {errors.engine && <span className="field-error">{errors.engine}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-average">Fuel average (km/l) *</label>
                  <input
                    id="sell-average"
                    type="number"
                    inputMode="decimal"
                    value={form.fuelAverage}
                    onChange={(event) => update('fuelAverage', event.target.value)}
                    placeholder="16"
                    aria-invalid={Boolean(errors.fuelAverage)}
                  />
                  {errors.fuelAverage && <span className="field-error">{errors.fuelAverage}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-color">Colour *</label>
                  <input
                    id="sell-color"
                    value={form.color}
                    onChange={(event) => update('color', event.target.value)}
                    placeholder="Pearl White"
                    aria-invalid={Boolean(errors.color)}
                  />
                  {errors.color && <span className="field-error">{errors.color}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-seats">Seats</label>
                  <select
                    id="sell-seats"
                    value={form.seats}
                    onChange={(event) => update('seats', event.target.value)}
                  >
                    {[2, 4, 5, 7, 8].map((seats) => (
                      <option key={seats} value={seats}>{seats}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section__head">
                <span className="form-section__number">02</span>
                <div>
                  <h2>Description & features</h2>
                  <p>Help buyers understand the condition and equipment.</p>
                </div>
              </div>
              <div className="field">
                <label htmlFor="sell-description">Description *</label>
                <textarea
                  id="sell-description"
                  rows={5}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  placeholder="Share the condition, service history, ownership, tyres, AC performance and any upgrades…"
                  aria-invalid={Boolean(errors.description)}
                />
                <div className="field-hint">
                  <span>{errors.description ? <span className="field-error">{errors.description}</span> : 'Minimum 30 characters.'}</span>
                  <span>{form.description.length} characters</span>
                </div>
              </div>
              <div className="field">
                <span className="field-label">Features</span>
                <div className="feature-picker">
                  {FEATURE_OPTIONS.map((feature) => (
                    <label key={feature} className={features.includes(feature) ? 'is-checked' : ''}>
                      <input
                        type="checkbox"
                        checked={features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                      />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="form-section">
              <div className="form-section__head">
                <span className="form-section__number">03</span>
                <div>
                  <h2>Photos</h2>
                  <p>Add up to {MAX_PHOTOS} clear photos. Listings with photos sell faster.</p>
                </div>
              </div>

              <div
                className={`upload-zone ${dragging ? 'is-dragging' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void handleFiles(event.dataTransfer.files);
                }}
              >
                <span className="upload-zone__icon"><Upload size={24} /></span>
                <h3>Drag & drop photos here</h3>
                <p>JPG, PNG or WebP · up to 8 MB each · {photos.length}/{MAX_PHOTOS} added</p>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={16} /> Choose photos
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(event) => {
                    if (event.target.files) void handleFiles(event.target.files);
                    event.target.value = '';
                  }}
                />
              </div>
              {photoError && <span className="field-error">{photoError}</span>}

              {photos.length > 0 && (
                <div className="photo-grid">
                  {photos.map((photo, index) => (
                    <div className="photo-preview" key={`${photo.slice(0, 30)}-${index}`}>
                      <img src={photo} alt={`Upload preview ${index + 1}`} />
                      {index === 0 && <span className="photo-preview__cover">Cover</span>}
                      <button type="button" onClick={() => removePhoto(index)} aria-label={`Remove photo ${index + 1}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button type="button" className="photo-add" onClick={() => fileRef.current?.click()}>
                      <Camera size={20} /> Add more
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="form-section">
              <div className="form-section__head">
                <span className="form-section__number">04</span>
                <div>
                  <h2>Seller information</h2>
                  <p>Buyers will use these details to contact you.</p>
                </div>
              </div>

              <div className="field">
                <span className="field-label">I am selling as</span>
                <div className="seller-type-toggle">
                  {(['Private', 'Dealer'] as SellerType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={form.sellerType === type ? 'is-active' : ''}
                      onClick={() => update('sellerType', type)}
                    >
                      {type === 'Private' ? 'Private seller' : 'Dealership'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row form-row--3">
                <div className="field">
                  <label htmlFor="sell-name">Full name *</label>
                  <input
                    id="sell-name"
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="Your full name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-phone">Phone number *</label>
                  <input
                    id="sell-phone"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    placeholder="0300 1234567"
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
                <div className="field">
                  <label htmlFor="sell-email">Email (optional)</label>
                  <input
                    id="sell-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(event) => update('terms', event.target.checked)}
                  aria-invalid={Boolean(errors.terms)}
                />
                <span>
                  I confirm the car details are accurate and I have the right to sell this vehicle.
                  I agree to AutoMart&apos;s listing guidelines.
                </span>
              </label>
              {errors.terms && <span className="field-error">{errors.terms}</span>}

              <div className="sell-submit">
                <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish My Listing'}
                  <CheckCircle2 size={18} />
                </button>
                <span><Info size={14} /> Your listing goes live immediately. You can ask us to remove it any time.</span>
              </div>
            </section>
          </form>

          <aside className="sell-sidebar">
            <div className="sell-preview">
              <span className="eyebrow">Live preview</span>
              <div className="sell-preview__card">
                <div className="sell-preview__media">
                  {previewImage ? (
                    <img src={previewImage} alt="Your listing preview" />
                  ) : (
                    <span><ImagePlus size={26} /> Add a cover photo</span>
                  )}
                </div>
                <div className="sell-preview__body">
                  <span>{form.brand || 'Brand'} · {form.year || 'Year'}</span>
                  <strong>{form.model || 'Your car model'} {form.variant}</strong>
                  <div className="sell-preview__price">{priceLabel}</div>
                  <small>
                    {form.mileage ? `${Number(form.mileage).toLocaleString('en-PK')} km` : 'Mileage'} · {form.city || 'City'}
                  </small>
                </div>
              </div>
              <p>This is how buyers will see your car in search results.</p>
            </div>

            <div className="sell-benefits">
              <h3>Why sell on AutoMart?</h3>
              <ul>
                <li><BadgeCheck size={18} /><span><strong>Free to list</strong>No charge for a basic listing.</span></li>
                <li><ShieldCheck size={18} /><span><strong>Verified buyers</strong>Real enquiries from across Pakistan.</span></li>
                <li><Sparkles size={18} /><span><strong>Professional presentation</strong>Clean cards, photo gallery and specs.</span></li>
              </ul>
            </div>

            <div className="sell-tips">
              <h3><Camera size={18} /> Photo tips</h3>
              <ul>
                <li>Shoot in natural daylight, never in the dark.</li>
                <li>Show the front, rear, both sides and the interior.</li>
                <li>Make sure the number plate and badges are visible.</li>
                <li>Be honest about scratches, dents and mileage.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
