import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useApp } from '../context/AppContext';
import { minLength, required, validateEmail, validatePhone } from '../utils/validation';
import { usePageTitle } from '../hooks/usePageTitle';

const FAQS = [
  {
    question: 'Is it free to list my car on AutoMart?',
    answer:
      'Yes. A basic listing with photos, specifications and your contact details is completely free. We do not charge buyers or sellers to use the marketplace.',
  },
  {
    question: 'How do I know a seller is genuine?',
    answer:
      'Look for the Verified badge, check the seller rating and always inspect the car and documents in person. Never pay a deposit before seeing the vehicle.',
  },
  {
    question: 'Can I compare more than two cars?',
    answer:
      'Yes — you can add up to four cars to the comparison tool and see price, engine, fuel average, mileage, transmission, year and features side by side.',
  },
  {
    question: 'How do I remove my listing?',
    answer:
      'If you created the listing while logged in, open My Listings and remove it. You can also contact our team and we will take it down for you.',
  },
  {
    question: 'Do you offer financing or insurance?',
    answer:
      'AutoMart is a marketplace, not a bank. We show an indicative instalment estimate on each car, but finance and insurance are arranged directly with your bank or provider.',
  },
  {
    question: 'Which cities do you cover?',
    answer:
      'Listings currently cover Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Hyderabad and Bahawalpur.',
  },
];

export function Contact() {
  usePageTitle(
    'Contact AutoMart Pakistan',
    'Get in touch with AutoMart Pakistan for buying, selling, listing support or partnership enquiries. Call, WhatsApp or send us a message.',
  );
  const { saveMessage, addToast, user } = useApp();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    subject: 'Buying a car',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {
      name: required(form.name, 'Your name'),
      email: required(form.email, 'Email') || validateEmail(form.email),
      phone: validatePhone(form.phone),
      subject: required(form.subject, 'Subject'),
      message: minLength(form.message, 20, 'Message'),
    };
    const cleaned = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value));
    setErrors(cleaned);
    if (Object.keys(cleaned).length > 0) return;

    saveMessage({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: form.subject,
      message: form.message.trim(),
    });
    setSubmitted(true);
    addToast('Thanks! Your message has been sent to the AutoMart team.');
  };

  const reset = () => {
    setForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      subject: 'Buying a car',
      message: '',
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="contact-page">
      <PageHeader
        eyebrow="We're here to help"
        title="Contact AutoMart Pakistan"
        description="Questions about buying, selling or a listing? Our team is one message away."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact Us' }]}
      >
        <div className="page-header__stats">
          <span><Clock size={16} /> Mon–Sat, 9am–8pm</span>
          <span><MessageCircle size={16} /> WhatsApp available</span>
          <span><MapPin size={16} /> Lahore, Pakistan</span>
        </div>
      </PageHeader>

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Get in touch</span>
            <h2>Let&apos;s talk cars.</h2>
            <p>
              Whether you are buying your first car, selling a family vehicle or need help with a
              listing, we will point you in the right direction.
            </p>

            <div className="contact-cards">
              <a href="tel:+923001234567" className="contact-card">
                <span className="contact-card__icon"><Phone size={20} /></span>
                <span>
                  <small>Call us</small>
                  <strong>+92 300 1234567</strong>
                  <span>Mon–Sat, 9am–8pm</span>
                </span>
              </a>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="contact-card">
                <span className="contact-card__icon contact-card__icon--green"><MessageCircle size={20} /></span>
                <span>
                  <small>WhatsApp</small>
                  <strong>Chat with our team</strong>
                  <span>Fastest response time</span>
                </span>
              </a>
              <a href="mailto:hello@automart.pk" className="contact-card">
                <span className="contact-card__icon"><Mail size={20} /></span>
                <span>
                  <small>Email</small>
                  <strong>hello@automart.pk</strong>
                  <span>We reply within one working day</span>
                </span>
              </a>
              <div className="contact-card">
                <span className="contact-card__icon"><MapPin size={20} /></span>
                <span>
                  <small>Visit our office</small>
                  <strong>Gulberg III, Lahore</strong>
                  <span>Office 12, Main Boulevard</span>
                </span>
              </div>
            </div>

            <div className="contact-trust">
              <ShieldCheck size={19} />
              <p>
                We never ask for advance payments or share your details with third parties. Report
                suspicious listings to <a href="mailto:safety@automart.pk">safety@automart.pk</a>.
              </p>
            </div>
          </div>

          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success">
                <span className="contact-success__icon"><CheckCircle2 size={32} /></span>
                <span className="eyebrow">Message received</span>
                <h2>Thank you, {form.name.split(' ')[0] || 'friend'}.</h2>
                <p>
                  Your message about <strong>{form.subject.toLowerCase()}</strong> has been saved. Our
                  team will get back to you at {form.email} within one working day.
                </p>
                <div className="contact-success__actions">
                  <button type="button" className="btn btn--primary" onClick={reset}>
                    Send another message
                  </button>
                  <Link to="/buy" className="btn btn--ghost">Browse cars</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="contact-form-card__head">
                  <span className="eyebrow">Send a message</span>
                  <h2>How can we help?</h2>
                  <p>Fill in the form and we will get back to you shortly.</p>
                </div>
                <form className="form" onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="contact-name">Your name *</label>
                      <input
                        id="contact-name"
                        value={form.name}
                        onChange={(event) => update('name', event.target.value)}
                        placeholder="Full name"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="contact-phone">Phone number *</label>
                      <input
                        id="contact-phone"
                        value={form.phone}
                        onChange={(event) => update('phone', event.target.value)}
                        placeholder="0300 1234567"
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="contact-email">Email address *</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                    <div className="field">
                      <label htmlFor="contact-subject">Subject *</label>
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(event) => update('subject', event.target.value)}
                        aria-invalid={Boolean(errors.subject)}
                      >
                        <option>Buying a car</option>
                        <option>Selling a car</option>
                        <option>Listing support</option>
                        <option>Report a listing</option>
                        <option>Partnership</option>
                        <option>Something else</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      rows={6}
                      value={form.message}
                      onChange={(event) => update('message', event.target.value)}
                      placeholder="Tell us what you need help with…"
                      aria-invalid={Boolean(errors.message)}
                    />
                    <div className="field-hint">
                      <span>{errors.message ? <span className="field-error">{errors.message}</span> : 'Minimum 20 characters.'}</span>
                      <span>{form.message.length} characters</span>
                    </div>
                  </div>
                  <button type="submit" className="btn btn--primary btn--lg btn--block">
                    <Send size={17} /> Send Message
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="section contact-map-section">
        <div className="container contact-map">
          <div className="contact-map__frame">
            <iframe
              title="AutoMart Pakistan office location in Lahore"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.330%2C31.505%2C74.390%2C31.545&layer=mapnik&marker=31.525%2C74.360"
              loading="lazy"
            />
          </div>
          <div className="contact-map__info">
            <span className="eyebrow">Find us</span>
            <h2>Visit the AutoMart office</h2>
            <p>Office 12, Main Boulevard, Gulberg III, Lahore, Punjab.</p>
            <ul>
              <li><Clock size={16} /> Monday–Saturday, 9:00am–8:00pm</li>
              <li><Phone size={16} /> +92 300 1234567</li>
              <li><Mail size={16} /> hello@automart.pk</li>
            </ul>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Gulberg+III+Lahore"
              target="_blank"
              rel="noreferrer"
              className="btn btn--dark"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <section className="section contact-faq" id="faq">
        <div className="container contact-faq__grid">
          <div className="contact-faq__intro">
            <span className="eyebrow">FAQs</span>
            <h2>Answers to common questions</h2>
            <p>Can&apos;t find what you need? Send us a message and we will help personally.</p>
            <Link to="/about#safety" className="btn btn--ghost">Read our safety tips</Link>
          </div>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronDown size={18} />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
