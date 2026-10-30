import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { isEmail } from '../utils/validation';

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const { subscribe, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!isEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    subscribe(email);
    addToast('You are subscribed. Watch your inbox for the best car deals.');
    setEmail('');
    setError('');
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-newsletter">
          <div>
            <span className="eyebrow eyebrow--light">Stay ahead of the market</span>
            <h3>Get the best car deals in your inbox.</h3>
            <p>New listings, price drops and buying advice — once a week, no spam.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe} noValidate>
            <div className="newsletter-form__row">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your email address"
                aria-label="Email address for newsletter"
                aria-invalid={Boolean(error)}
              />
              <button type="submit" className="btn btn--primary">
                Subscribe <Send size={16} />
              </button>
            </div>
            {error && <span className="field-error">{error}</span>}
          </form>
        </div>

        <div className="footer-main">
          <div className="footer-brand">
            <Logo variant="light" />
            <p>
              Pakistan&apos;s premium marketplace for buying, selling and comparing cars. Verified
              listings, transparent pricing and trusted sellers — from Karachi to Peshawar.
            </p>
            <ul className="footer-contact">
              <li>
                <MapPin size={16} />
                <span>Office 12, Main Boulevard, Gulberg III, Lahore</span>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+923001234567">+92 300 1234567</a>
              </li>
              <li>
                <Mail size={16} />
                <a href="mailto:hello@automart.pk">hello@automart.pk</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/buy">Buy Cars</Link>
            <Link to="/sell">Sell Your Car</Link>
            <Link to="/compare">Compare Cars</Link>
            <Link to="/favorites">Saved Cars</Link>
          </div>

          <div className="footer-col">
            <h4>Popular Brands</h4>
            <Link to="/buy?brand=Suzuki">Suzuki</Link>
            <Link to="/buy?brand=Honda">Honda</Link>
            <Link to="/buy?brand=Toyota">Toyota</Link>
            <Link to="/buy?brand=Kia">Kia</Link>
            <Link to="/buy?brand=Hyundai">Hyundai</Link>
            <Link to="/buy?brand=Haval">Haval</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/login">Login / Sign Up</Link>
            <Link to="/my-listings">My Listings</Link>
            <Link to="/about#safety">Safety Tips</Link>
            <Link to="/contact#faq">FAQs</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {CURRENT_YEAR} AutoMart Pakistan. All rights reserved.</p>
          <p className="footer-credit">
            A project by <strong>Hadi Awais</strong> · PNY Training Centre
          </p>
          <button
            type="button"
            className="footer-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
