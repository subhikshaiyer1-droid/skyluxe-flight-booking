import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Plane,
  Menu,
  X,
  Compass,
  Search,
  BookmarkCheck,
  Info,
  Home,
  Heart,
  Clock,
  User,
  Calculator,
  DollarSign,
  Map
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeBookingCount, setActiveBookingCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const location = useLocation();

  // Load count of demo bookings from localStorage (only active, not cancelled)
  const updateCounts = () => {
    try {
      const storedBookings = localStorage.getItem('skyluxe_bookings');
      if (storedBookings) {
        const parsed = JSON.parse(storedBookings);
        if (Array.isArray(parsed)) {
          const activeOnly = parsed.filter((b) => !b.status?.includes('CANCELLED'));
          setActiveBookingCount(activeOnly.length);
        } else {
          setActiveBookingCount(0);
        }
      } else {
        setActiveBookingCount(0);
      }

      // Count of saved destinations + flights
      const storedDests = localStorage.getItem('skyluxe_saved_destinations');
      const storedFlights = localStorage.getItem('skyluxe_saved_flights');
      const destsArr = storedDests ? JSON.parse(storedDests) : [];
      const flightsArr = storedFlights ? JSON.parse(storedFlights) : [];
      const totalSaved = (Array.isArray(destsArr) ? destsArr.length : 0) + (Array.isArray(flightsArr) ? flightsArr.length : 0);
      setSavedCount(totalSaved);
    } catch {
      setActiveBookingCount(0);
      setSavedCount(0);
    }
  };

  useEffect(() => {
    updateCounts();
    setMobileMenuOpen(false);

    const handleStorageChange = () => updateCounts();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('skyluxe_booking_updated', handleStorageChange);
    window.addEventListener('skyluxe_saved_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('skyluxe_booking_updated', handleStorageChange);
      window.removeEventListener('skyluxe_saved_updated', handleStorageChange);
    };
  }, [location.pathname]);

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" aria-label="SkyLuxe Home">
            <div className="brand-icon">
              <Plane size={24} strokeWidth={2.5} style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Sky<span>Luxe</span></span>
              <span className="brand-tagline">Your journey, made simple.</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav>
            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  end
                >
                  <Home size={16} />
                  <span>Home</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/search"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Search size={16} />
                  <span>Flights</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/multi-city"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Map size={16} />
                  <span>Multi-City</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/destinations"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Compass size={16} />
                  <span>Destinations</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/trip-planner"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Calculator size={16} />
                  <span>Budget</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/currency-converter"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <DollarSign size={16} />
                  <span>Currency</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/saved"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Heart size={16} />
                  <span>Wishlist</span>
                  {savedCount > 0 && (
                    <span className="bookings-badge" style={{ background: '#EF4444' }} title={`${savedCount} saved items`}>
                      {savedCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <BookmarkCheck size={16} />
                  <span>Bookings</span>
                  {activeBookingCount > 0 && (
                    <span className="bookings-badge" title={`${activeBookingCount} active bookings`}>
                      {activeBookingCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <User size={16} />
                  <span>Profile</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Info size={16} />
                  <span>About</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}
