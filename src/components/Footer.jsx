import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Heart, ShieldCheck, Award, Clock, Compass, DollarSign, Map } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '16px' }}>
              <div className="brand-icon">
                <Plane size={22} style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <div className="brand-text">
                <span className="brand-title" style={{ color: 'white' }}>Sky<span style={{ color: 'var(--color-primary)' }}>Luxe</span></span>
                <span className="brand-tagline" style={{ color: '#A0B2C6' }}>Your journey, made simple.</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              A comprehensive domestic & international flight booking platform crafted for seamless trip planning, transparent pricing, and academic demonstration.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Flights & Routes</h4>
            <ul className="footer-links">
              <li><Link to="/search?category=domestic" className="footer-link">Domestic Flights (India)</Link></li>
              <li><Link to="/search?category=international" className="footer-link">International Flights</Link></li>
              <li><Link to="/multi-city" className="footer-link">Multi-City Hop-on Route</Link></li>
              <li><Link to="/destinations" className="footer-link">Destination Catalog (69)</Link></li>
              <li><Link to="/flight-status" className="footer-link">Flight Status Tracker</Link></li>
            </ul>
          </div>

          {/* Travel Tools */}
          <div>
            <h4 className="footer-col-title">Smart Tools</h4>
            <ul className="footer-links">
              <li><Link to="/trip-planner" className="footer-link">Smart Trip Budget Planner</Link></li>
              <li><Link to="/currency-converter" className="footer-link">Travel Currency Converter</Link></li>
              <li><Link to="/saved" className="footer-link">Saved Flights & Wishlist</Link></li>
              <li><Link to="/my-bookings" className="footer-link">My Bookings & Boarding Pass</Link></li>
              <li><Link to="/profile" className="footer-link">Traveller Profile</Link></li>
            </ul>
          </div>

          {/* Project Details & College Notice */}
          <div>
            <h4 className="footer-col-title">Project & Viva</h4>
            <ul className="footer-links" style={{ marginBottom: '12px' }}>
              <li><Link to="/about" className="footer-link">About Architecture</Link></li>
              <li><Link to="/about#viva" className="footer-link">College Viva Q&A Guide</Link></li>
              <li><span className="footer-link" style={{ opacity: 0.8 }}>React 19 + Vite + LocalStorage</span></li>
            </ul>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem',
              lineHeight: '1.45'
            }}>
              <span style={{ color: 'var(--color-orange)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                🎓 Academic Viva Project
              </span>
              <p style={{ color: '#8FA6C4', margin: 0 }}>
                Safe simulation. All tickets, fares, PNRs, and exchange rates are simulated estimates for university review.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SkyLuxe Flight Booking Platform. Academic Demonstration.</p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8FA6C4' }}>
              <ShieldCheck size={16} color="var(--color-success)" /> No Real Payment Needed
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8FA6C4' }}>
              <Award size={16} color="var(--color-orange)" /> 100% Viva Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
