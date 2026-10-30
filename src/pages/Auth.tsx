import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useApp } from '../context/AppContext';
import {
  required,
  validateEmail,
  validatePassword,
  validatePhone,
} from '../utils/validation';
import { usePageTitle } from '../hooks/usePageTitle';

export function Auth() {
  const { user, login, signup, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const mode: 'login' | 'signup' = pathname === '/signup' ? 'signup' : 'login';
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  usePageTitle(
    mode === 'login' ? 'Log In' : 'Create Account',
    'Log in to your AutoMart Pakistan account to save cars, compare listings and manage your car ads.',
  );

  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
    if (formError) setFormError('');
  };

  const switchMode = (next: 'login' | 'signup') => {
    setErrors({});
    setFormError('');
    const base = next === 'signup' ? '/signup' : '/login';
    const query = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';
    navigate(`${base}${query}`, { replace: true });
  };

  const fillDemo = () => {
    setForm((current) => ({
      ...current,
      email: 'demo@automart.pk',
      password: 'automart123',
    }));
    setFormError('');
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (mode === 'login') {
      nextErrors.email = required(form.email, 'Email') || validateEmail(form.email);
      nextErrors.password = required(form.password, 'Password');
    } else {
      nextErrors.name = required(form.name, 'Full name');
      nextErrors.email = required(form.email, 'Email') || validateEmail(form.email);
      nextErrors.phone = validatePhone(form.phone);
      nextErrors.password = validatePassword(form.password);
      nextErrors.confirm = form.confirm === form.password ? '' : 'Passwords do not match.';
      nextErrors.terms = form.terms ? '' : 'Please accept the terms to continue.';
    }

    const cleaned = Object.fromEntries(Object.entries(nextErrors).filter(([, value]) => value));
    setErrors(cleaned);
    if (Object.keys(cleaned).length > 0) return;

    const result =
      mode === 'login'
        ? login(form.email, form.password)
        : signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });

    if (!result.ok) {
      setFormError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    navigate(redirect, { replace: true });
  };

  if (user) {
    return (
      <div className="auth-page">
        <div className="container auth-signed-in">
          <div className="auth-signed-in__card">
            <span className="avatar avatar--xl">{user.name.charAt(0).toUpperCase()}</span>
            <span className="eyebrow">You&apos;re signed in</span>
            <h1>Welcome back, {user.name.split(' ')[0]}.</h1>
            <p>{user.email} · Member since {new Date(user.joinedAt).getFullYear()}</p>
            <div className="auth-signed-in__actions">
              <Link to="/my-listings" className="btn btn--primary">My Listings <ArrowRight size={16} /></Link>
              <Link to="/favorites" className="btn btn--ghost"><Heart size={16} /> Saved Cars</Link>
              <Link to="/buy" className="btn btn--ghost">Browse Cars</Link>
            </div>
            <button type="button" className="auth-signout" onClick={() => logout()}>
              Sign out of this account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container auth-layout">
        <div className="auth-panel">
          <div className="auth-panel__top">
            <Logo />
            <Link to="/" className="auth-back">
              Back to home
            </Link>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => switchMode('login')}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => switchMode('signup')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-heading">
            <span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join AutoMart'}</span>
            <h1>{mode === 'login' ? 'Log in to your account' : 'Create your free account'}</h1>
            <p>
              {mode === 'login'
                ? 'Save cars, compare listings and manage your ads in one place.'
                : 'Save your favourite cars, publish listings and get buyer enquiries.'}
            </p>
          </div>

          {formError && (
            <div className="form-alert" role="alert">
              {formError}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-name">Full name</label>
                <div className="input-with-icon">
                  <User size={17} />
                  <input
                    id="auth-name"
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="e.g. Hadi Awais"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-email">Email address</label>
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="auth-phone">Mobile number</label>
                <div className="input-with-icon">
                  <Phone size={17} />
                  <input
                    id="auth-phone"
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    placeholder="0300 1234567"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            )}

            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <div className="input-with-icon input-with-icon--action">
                <LockKeyhole size={17} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  placeholder={mode === 'login' ? 'Enter your password' : 'At least 6 characters'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {mode === 'signup' && (
              <>
                <div className="field">
                  <label htmlFor="auth-confirm">Confirm password</label>
                  <div className="input-with-icon">
                    <LockKeyhole size={17} />
                    <input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(event) => update('confirm', event.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirm)}
                    />
                  </div>
                  {errors.confirm && <span className="field-error">{errors.confirm}</span>}
                </div>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(event) => update('terms', event.target.checked)}
                  />
                  <span>
                    I agree to the AutoMart Pakistan terms of use and privacy policy.
                  </span>
                </label>
                {errors.terms && <span className="field-error">{errors.terms}</span>}
              </>
            )}

            <button type="submit" className="btn btn--primary btn--block btn--lg">
              {mode === 'login' ? 'Log In' : 'Create My Account'} <ArrowRight size={17} />
            </button>
          </form>

          {mode === 'login' && (
            <div className="demo-account">
              <div>
                <strong>Try the demo account</strong>
                <span>demo@automart.pk · automart123</span>
              </div>
              <button type="button" className="btn btn--ghost btn--sm" onClick={fillDemo}>
                Use demo
              </button>
            </div>
          )}

          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                New to AutoMart?{' '}
                <button type="button" onClick={() => switchMode('signup')}>Create a free account</button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}>Log in</button>
              </>
            )}
          </p>

          <p className="auth-privacy">
            <ShieldCheck size={14} /> Your details stay private and are only shared with sellers you contact.
          </p>
        </div>

        <aside className="auth-visual">
          <div className="auth-visual__bg">
            <img src="/images/cars/hero-kaghan.webp" alt="Scenic mountain road landscape in Pakistan" />
          </div>
          <div className="auth-visual__content">
            <Logo variant="light" />
            <div className="auth-visual__quote">
              <span className="eyebrow eyebrow--light">Drive with confidence</span>
              <h2>Your next car is closer than you think.</h2>
              <p>
                Join thousands of Pakistani buyers and sellers who use AutoMart to make smarter
                automotive decisions.
              </p>
              <ul>
                <li><CheckCircle2 size={17} /> Verified listings across 12 cities</li>
                <li><CheckCircle2 size={17} /> Compare up to four cars at once</li>
                <li><CheckCircle2 size={17} /> Free, professional car listings</li>
              </ul>
            </div>
            <div className="auth-visual__stats">
              <div><strong>27+</strong><span>Live listings</span></div>
              <div><strong>4.9/5</strong><span>Buyer rating</span></div>
              <div><strong>12</strong><span>Cities</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
