import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CheckCircle2,
  Eye,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { usePageTitle } from '../hooks/usePageTitle';

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust first',
    text: 'Every listing is structured around the details that matter — ownership, mileage, documents and seller identity.',
  },
  {
    icon: Eye,
    title: 'Radical transparency',
    text: 'Clear PKR pricing, honest specifications and no hidden fees. What you see is what you get.',
  },
  {
    icon: MapPin,
    title: 'Built for Pakistan',
    text: 'From Alto to Fortuner, our catalogue reflects the cars Pakistan actually drives, city by city.',
  },
  {
    icon: Sparkles,
    title: 'Design obsessed',
    text: 'A marketplace should feel as good as the car you are buying. We sweat every card, filter and interaction.',
  },
];

const safetyTips = [
  'Always inspect the car in person during daylight before paying anything.',
  'Meet the seller in a public place and take a friend or family member with you.',
  'Verify the registration book, chassis number and engine number against the car.',
  'Check for outstanding bank leases, challans and token tax before transfer.',
  'Take a trusted mechanic for a pre-purchase inspection.',
  'Never send a deposit or share OTP codes before seeing the vehicle.',
];

export function About() {
  usePageTitle(
    'About AutoMart Pakistan',
    'Learn about AutoMart Pakistan — a premium car marketplace built by Hadi Awais at PNY Training Centre to make buying and selling cars simpler.',
  );

  return (
    <div className="about-page">
      <PageHeader
        eyebrow="Our story"
        title="Built for the way Pakistan buys cars"
        description="AutoMart Pakistan brings verified listings, transparent pricing and smart comparison tools to one polished marketplace."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
      >
        <div className="page-header__stats">
          <span><Users size={16} /> 27+ curated listings</span>
          <span><MapPin size={16} /> 12 cities</span>
          <span><Award size={16} /> PNY Training Centre project</span>
        </div>
      </PageHeader>

      <section className="section about-story">
        <div className="container about-story__grid">
          <div className="about-story__visual">
            <img src="/images/cars/about-market.webp" alt="Cars on display at a Pakistani automotive market" />
            <div className="about-story__badge">
              <span className="about-story__badge-icon"><BadgeCheck size={20} /></span>
              <div>
                <strong>Made in Pakistan</strong>
                <small>Designed for local buyers and sellers.</small>
              </div>
            </div>
          </div>
          <div className="about-story__content">
            <span className="eyebrow">Why we built AutoMart</span>
            <h2>Car shopping in Pakistan deserves a better experience.</h2>
            <p>
              Finding the right car often means scrolling through endless unverified ads, calling
              sellers who never pick up, and comparing prices across half a dozen websites. We wanted
              something cleaner, faster and more trustworthy.
            </p>
            <p>
              AutoMart Pakistan was created by <strong>Hadi Awais</strong> at <strong>PNY Training
              Centre</strong> with a clear goal: build a marketplace that feels premium, respects the
              buyer&apos;s time and gives genuine sellers a professional place to present their cars.
            </p>
            <p>
              Today the platform covers 27 hand-curated listings across 12 cities, from everyday
              hatchbacks to family SUVs — with the tools to search, compare and decide with confidence.
            </p>
            <div className="about-story__stats">
              <div><strong>27+</strong><span>Curated listings</span></div>
              <div><strong>12</strong><span>Cities covered</span></div>
              <div><strong>6</strong><span>Trusted brands</span></div>
            </div>
            <Link to="/buy" className="btn btn--primary">
              Explore the marketplace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <div className="section-heading section-heading--center">
            <div className="section-heading__text">
              <span className="eyebrow">What we stand for</span>
              <h2>Values that shape every listing</h2>
              <p>Four principles guide how we build AutoMart and how we treat the people who use it.</p>
            </div>
          </div>
          <div className="value-grid">
            {values.map((value) => (
              <article className="value-card" key={value.title}>
                <span className="value-card__icon"><value.icon size={22} /></span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-verify">
        <div className="container about-verify__grid">
          <div className="about-verify__content">
            <span className="eyebrow">How verification works</span>
            <h2>More confidence, fewer surprises.</h2>
            <p>
              A verified badge is not a warranty, but it does mean the seller and listing have passed
              a basic set of checks before appearing on AutoMart.
            </p>
            <ol className="verify-steps">
              <li>
                <span>01</span>
                <div><strong>Seller identity</strong><p>Name and mobile number are confirmed before a listing goes live.</p></div>
              </li>
              <li>
                <span>02</span>
                <div><strong>Listing details</strong><p>We review the car, year, mileage, price and city for obvious inconsistencies.</p></div>
              </li>
              <li>
                <span>03</span>
                <div><strong>Document guidance</strong><p>Buyers are reminded to verify the registration book, chassis number and lease status.</p></div>
              </li>
            </ol>
          </div>
          <div className="about-verify__card">
            <span className="about-verify__icon"><ShieldCheck size={26} /></span>
            <h3>Buy and sell with confidence</h3>
            <p>Every listing shows the seller type, rating, city and contact options clearly — so you always know who you are dealing with.</p>
            <ul>
              <li><CheckCircle2 size={16} /> Verified seller badge</li>
              <li><CheckCircle2 size={16} /> Transparent PKR pricing</li>
              <li><CheckCircle2 size={16} /> Safety guidance on every car</li>
            </ul>
            <Link to="/buy" className="btn btn--dark btn--block">Browse verified cars</Link>
          </div>
        </div>
      </section>

      <section className="section about-team">
        <div className="container">
          <div className="section-heading section-heading--center">
            <div className="section-heading__text">
              <span className="eyebrow">Behind the project</span>
              <h2>Leadership & academic partner</h2>
              <p>A focused project with a clear owner and a supportive learning institute.</p>
            </div>
          </div>
          <div className="team-grid">
            <article className="team-card">
              <span className="team-card__avatar">HA</span>
              <h3>Hadi Awais</h3>
              <span className="team-card__role">Founder & Project Lead</span>
              <p>Product direction, marketplace design and full-stack development of AutoMart Pakistan.</p>
              <div className="team-card__meta"><Target size={15} /> Vision · Design · Engineering</div>
            </article>
            <article className="team-card">
              <span className="team-card__avatar team-card__avatar--institute">PNY</span>
              <h3>PNY Training Centre</h3>
              <span className="team-card__role">Academic Partner</span>
              <p>Providing the learning environment, mentorship and technical foundation behind the project.</p>
              <div className="team-card__meta"><HeartHandshake size={15} /> Mentorship · Training</div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-safety" id="safety">
        <div className="container">
          <div className="section-heading">
            <div className="section-heading__text">
              <span className="eyebrow">Buyer & seller safety</span>
              <h2>Six rules for a safe car deal</h2>
              <p>Simple habits that protect your money and your time.</p>
            </div>
          </div>
          <div className="safety-grid">
            {safetyTips.map((tip, index) => (
              <div className="safety-card" key={tip}>
                <span className="safety-card__number">{String(index + 1).padStart(2, '0')}</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
          <div className="safety-cta">
            <div>
              <h3>Need help with a listing?</h3>
              <p>Our team can guide you through inspection, negotiation and transfer.</p>
            </div>
            <Link to="/contact" className="btn btn--primary">Contact AutoMart <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
