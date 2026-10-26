import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Heart, ShieldCheck, Award, Clock } from 'lucide-react';

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
              A modern, intuitive flight booking platform designed to make air travel planning seamless, reliable, and delightful.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/search" className="footer-link">Search Flights</Link></li>
              <li><Link to="/destinations" className="footer-link">Popular Destinations</Link></li>
              <li><Link to="/my-bookings" className="footer-link">My Bookings</Link></li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="footer-col-title">Project Info</h4>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About SkyLuxe</Link></li>
              <li><Link to="/about#viva" className="footer-link">Viva Q&A Guide</Link></li>
              <li><Link to="/about#tech" className="footer-link">Tech Architecture</Link></li>
              <li><span className="footer-link">React 19 + Vite</span></li>
            </ul>
          </div>

          {/* College Demo Banner */}
          <div>
            <h4 className="footer-col-title">Academic Notice</h4>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              lineHeight: '1.5'
            }}>
              <p style={{ color: '#C4D5EB', marginBottom: '8px' }}>
                🎓 <strong>College Project Demonstration</strong>
              </p>
              <p style={{ color: '#8FA6C4', fontSize: '0.8rem' }}>
                This website is built for academic demonstration. All flights, prices, and booking confirmations are safe simulations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SkyLuxe. Built with clean code for academic presentation.</p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
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
