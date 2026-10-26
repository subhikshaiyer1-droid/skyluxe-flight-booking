import React from 'react';
import { Link } from 'react-router-dom';
import FlightSearchForm from '../components/FlightSearchForm';
import DestinationCard from '../components/DestinationCard';
import { DESTINATIONS } from '../data/destinations';
import {
  Search,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  Plane,
  HeartHandshake
} from 'lucide-react';

export default function HomePage() {
  const featuredDestinations = DESTINATIONS.slice(0, 4);

  return (
    <div className="home-page">
      {/* --------------------------------------------------------------------
          1. Hero Section
          -------------------------------------------------------------------- */}
      <section className="hero-section">
        <div className="hero-backdrop-decor"></div>
        <div className="container">
          <div className="hero-content">
            <div className="badge badge-primary hero-badge">
              <Sparkles size={14} color="var(--color-orange)" />
              <span>Simple, Fast & Reliable Booking</span>
            </div>

            <h1 className="hero-title">
              Find your next flight <span>with ease.</span>
            </h1>

            <p className="hero-subtitle">
              Compare flights, explore destinations, and plan your journey in a few simple steps.
            </p>
          </div>

          {/* Prominent Flight Search Form */}
          <FlightSearchForm />
        </div>
      </section>

      {/* --------------------------------------------------------------------
          2. Three Simple Steps Section
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header">
            <span className="badge badge-orange section-badge">How It Works</span>
            <h2 className="section-title">Three Simple Steps to the Skies</h2>
            <p className="section-subtitle">
              Booking your dream flight doesn’t need to be stressful. We streamlined the whole process.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon-box">
                <Search size={32} />
              </div>
              <h3 className="step-title">Search Flights</h3>
              <p className="step-desc">
                Select your departure and arrival cities, pick your preferred dates, and customize passenger count with live validation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon-box">
                <CheckCircle size={32} />
              </div>
              <h3 className="step-title">Select & Compare</h3>
              <p className="step-desc">
                Sort by cheapest, fastest, or earliest departure. Filter by your favorite airlines and non-stop routes in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-box">
                <CreditCard size={32} />
              </div>
              <h3 className="step-title">Instant Booking</h3>
              <p className="step-desc">
                Enter demo passenger details, receive an instant booking reference, and print your digital boarding pass anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          3. Popular Destinations Section
          -------------------------------------------------------------------- */}
      <section className="section-pad">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge badge-primary section-badge">Travel Inspiration</span>
              <h2 className="section-title" style={{ marginBottom: '8px' }}>Popular Destinations</h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                Handpicked getaways with unbeatable simulated fares.
              </p>
            </div>

            <Link to="/destinations" className="btn btn-secondary">
              <span>View All Destinations</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="destinations-grid">
            {featuredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. Why Choose SkyLuxe Section
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div className="section-header">
            <span className="badge badge-navy section-badge">Why SkyLuxe</span>
            <h2 className="section-title">Designed for Effortless Travel</h2>
            <p className="section-subtitle">
              Every detail is engineered to make your trip planning transparent, quick, and enjoyable.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Zap size={26} />
              </div>
              <h3 className="feature-title">Lightning Fast Search</h3>
              <p className="feature-desc">
                Instant flight matching with dynamic route calculations and immediate filter updates without sluggish page reloads.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: 'var(--color-orange-light)', color: 'var(--color-orange)' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 className="feature-title">Transparent Pricing</h3>
              <p className="feature-desc">
                Clear fare breakdowns showing base tickets, taxes, and service fees upfront. No hidden surcharges or surprise costs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                <Clock size={26} />
              </div>
              <h3 className="feature-title">Persistent Bookings</h3>
              <p className="feature-desc">
                Your demonstration tickets are saved safely in browser LocalStorage. Review, print, or manage them at any time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ backgroundColor: '#EDE7F6', color: '#673AB7' }}>
                <HeartHandshake size={26} />
              </div>
              <h3 className="feature-title">College Presentation Ready</h3>
              <p className="feature-desc">
                Built with clean, modular React architecture and beginner-friendly code, ideal for live demonstration and academic review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. CTA Callout Banner
          -------------------------------------------------------------------- */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, var(--color-navy) 0%, #153A68 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 40px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div>
              <span className="badge" style={{ background: 'rgba(255, 159, 67, 0.25)', color: 'var(--color-orange)', marginBottom: '12px' }}>
                Academic Project Demonstration
              </span>
              <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '8px' }}>
                Ready to explore the skies?
              </h2>
              <p style={{ color: '#C0D5EE', maxWidth: '540px', margin: 0 }}>
                Test our interactive search, choose your flight, and experience how seamless flight booking can be.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/search" className="btn btn-orange btn-lg">
                <Plane size={18} />
                <span>Search Flights Now</span>
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                <span>Learn About Project</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
