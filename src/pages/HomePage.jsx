import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FlightSearchForm from '../components/FlightSearchForm';
import DestinationCard from '../components/DestinationCard';
import { DESTINATIONS } from '../data/destinations';
import { getRecentSearches, clearRecentSearches } from '../utils/plannerStorage';
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
  HeartHandshake,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  RotateCcw,
  Tag,
  TrendingUp,
  Sun,
  Globe2
} from 'lucide-react';

// Popular domestic route quick cards
const POPULAR_DOMESTIC_ROUTES = [
  { from: 'BOM', to: 'GOI', fromCity: 'Mumbai', toCity: 'Goa', fare: '₹3,499', duration: '1h 10m', tag: 'Weekend Beach' },
  { from: 'DEL', to: 'BOM', fromCity: 'Delhi', toCity: 'Mumbai', fare: '₹4,299', duration: '2h 10m', tag: 'Business Corridor' },
  { from: 'BLR', to: 'DEL', fromCity: 'Bengaluru', toCity: 'Delhi', fare: '₹5,199', duration: '2h 45m', tag: 'High Frequency' },
  { from: 'MAA', to: 'CCU', fromCity: 'Chennai', toCity: 'Kolkata', fare: '₹4,799', duration: '2h 20m', tag: 'Heritage Hub' },
  { from: 'HYD', to: 'JAI', fromCity: 'Hyderabad', toCity: 'Jaipur', fare: '₹4,199', duration: '2h 00m', tag: 'Royal Palaces' },
  { from: 'DEL', to: 'SXR', fromCity: 'Delhi', toCity: 'Srinagar', fare: '₹5,899', duration: '1h 35m', tag: 'Valley Escape' }
];

// Popular international route quick cards
const POPULAR_INTERNATIONAL_ROUTES = [
  { from: 'BOM', to: 'DXB', fromCity: 'Mumbai', toCity: 'Dubai', flag: '🇦🇪', fare: '₹16,999', duration: '3h 30m', tag: 'Top Middle East' },
  { from: 'DEL', to: 'LHR', fromCity: 'Delhi', toCity: 'London', flag: '🇬🇧', fare: '₹42,500', duration: '9h 15m', tag: 'Flagship European' },
  { from: 'BOM', to: 'SIN', fromCity: 'Mumbai', toCity: 'Singapore', flag: '🇸🇬', fare: '₹18,400', duration: '5h 25m', tag: 'Gardens & City' },
  { from: 'BLR', to: 'BKK', fromCity: 'Bengaluru', toCity: 'Bangkok', flag: '🇹🇭', fare: '₹14,200', duration: '4h 10m', tag: 'Budget Friendly' },
  { from: 'DEL', to: 'HND', fromCity: 'Delhi', toCity: 'Tokyo', flag: '🇯🇵', fare: '₹38,900', duration: '7h 45m', tag: 'Cultural Capital' },
  { from: 'MAA', to: 'KUL', fromCity: 'Chennai', toCity: 'Kuala Lumpur', flag: '🇲🇾', fare: '₹12,900', duration: '3h 50m', tag: 'Popular Short Haul' }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    const handleUpdate = () => setRecentSearches(getRecentSearches());
    window.addEventListener('skyluxe_recent_searches_updated', handleUpdate);
    return () => window.removeEventListener('skyluxe_recent_searches_updated', handleUpdate);
  }, []);

  const handleClearSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRouteSearch = (from, to) => {
    navigate(`/search?from=${from}&to=${to}&date=2026-11-10&type=one-way&passengers=1&class=Economy`);
  };

  // Curated collections from DESTINATIONS
  const weekendGetaways = DESTINATIONS.filter((d) => ['goa', 'jaipur', 'udaipur', 'kochi'].includes(d.id));
  const budgetFriendlyTrips = DESTINATIONS.filter((d) => ['kathmandu', 'colombo', 'bangkok', 'varanasi'].includes(d.id));
  const trendingDestinations = DESTINATIONS.filter((d) => ['bali', 'paris', 'dubai', 'zurich'].includes(d.id));

  return (
    <div className="home-page">
      {/* --------------------------------------------------------------------
          1. Hero Section with Domestic & International Search Form
          -------------------------------------------------------------------- */}
      <section className="hero-section">
        <div className="hero-backdrop-decor"></div>
        <div className="container">
          <div className="hero-content">
            <div className="badge badge-primary hero-badge">
              <Sparkles size={14} color="var(--color-orange)" />
              <span>Domestic & International Flight Network</span>
            </div>

            <h1 className="hero-title">
              Find your next flight <span>with ease.</span>
            </h1>

            <p className="hero-subtitle">
              Book domestic routes across India or explore popular international destinations with transparent fares, seat selection, and instant boarding pass generation.
            </p>
          </div>

          {/* Search Form with Domestic vs International Tabs */}
          <FlightSearchForm />
        </div>
      </section>

      {/* --------------------------------------------------------------------
          2. Recently Searched Routes (Conditional)
          -------------------------------------------------------------------- */}
      {recentSearches.length > 0 && (
        <section className="recent-searches-bar">
          <div className="container">
            <div className="recent-searches-inner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <Clock size={16} color="var(--color-primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-navy)' }}>
                  Recently Searched:
                </span>
              </div>

              <div className="recent-chips-list">
                {recentSearches.map((item, idx) => (
                  <button
                    key={`recent-${idx}`}
                    type="button"
                    className="recent-search-chip"
                    onClick={() => handleRouteSearch(item.from, item.to)}
                    title={`Search ${item.fromCity || item.from} to ${item.toCity || item.to}`}
                  >
                    <Plane size={13} color="var(--color-primary)" />
                    <span style={{ fontWeight: 600 }}>{item.from} → {item.to}</span>
                    <span className="recent-chip-sub">({item.category || 'Flight'})</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn-clear-recent"
                onClick={handleClearSearches}
                title="Clear recent searches"
              >
                <RotateCcw size={13} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------------------
          3. Popular Domestic Flights Section
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-primary section-badge">India Domestic Network</span>
              <h2 className="section-title">Popular Domestic Routes</h2>
              <p className="section-subtitle">
                High-frequency routes between top Indian metros and holiday destinations with simulated starting fares.
              </p>
            </div>
            <Link to="/search?category=domestic" className="btn btn-outline btn-sm">
              <span>View All Domestic</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="route-cards-grid">
            {POPULAR_DOMESTIC_ROUTES.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="quick-route-card"
                onClick={() => handleRouteSearch(route.from, route.to)}
              >
                <div className="quick-route-header">
                  <span className="quick-route-tag">{route.tag}</span>
                  <span className="quick-route-time">{route.duration}</span>
                </div>

                <div className="quick-route-endpoints">
                  <div>
                    <div className="route-city-code">{route.from}</div>
                    <div className="route-city-name">{route.fromCity}</div>
                  </div>

                  <div className="route-arrow-icon">
                    <Plane size={18} color="var(--color-primary)" />
                  </div>

                  <div>
                    <div className="route-city-code">{route.to}</div>
                    <div className="route-city-name">{route.toCity}</div>
                  </div>
                </div>

                <div className="quick-route-footer">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Starting from</span>
                    <div className="quick-route-fare">{route.fare}</div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm">
                    Book Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          4. Popular International Flights Section
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-orange section-badge">Global Hubs</span>
              <h2 className="section-title">Popular International Routes</h2>
              <p className="section-subtitle">
                Direct and one-stop flights from Indian hubs to the Middle East, Europe, Southeast Asia, and beyond.
              </p>
            </div>
            <Link to="/search?category=international" className="btn btn-outline btn-sm">
              <span>View All International</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="route-cards-grid">
            {POPULAR_INTERNATIONAL_ROUTES.map((route) => (
              <div
                key={`${route.from}-${route.to}`}
                className="quick-route-card quick-route-card-intl"
                onClick={() => handleRouteSearch(route.from, route.to)}
              >
                <div className="quick-route-header">
                  <span className="quick-route-tag intl-tag">
                    {route.flag} {route.tag}
                  </span>
                  <span className="quick-route-time">{route.duration}</span>
                </div>

                <div className="quick-route-endpoints">
                  <div>
                    <div className="route-city-code">{route.from}</div>
                    <div className="route-city-name">{route.fromCity}</div>
                  </div>

                  <div className="route-arrow-icon">
                    <Globe2 size={18} color="var(--color-orange)" />
                  </div>

                  <div>
                    <div className="route-city-code">{route.to}</div>
                    <div className="route-city-name">{route.toCity}</div>
                  </div>
                </div>

                <div className="quick-route-footer">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Starting from</span>
                    <div className="quick-route-fare" style={{ color: 'var(--color-navy)' }}>{route.fare}</div>
                  </div>
                  <button type="button" className="btn btn-orange btn-sm">
                    Book Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          5. Smart Travel Tools Showcase Trio
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '32px' }}>
            <span className="badge badge-navy section-badge">Interactive Travel Toolkit</span>
            <h2 className="section-title">Plan Smarter with SkyLuxe Tools</h2>
            <p className="section-subtitle" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Everything you need to craft budgets, map out multi-destination journeys, and convert foreign currency.
            </p>
          </div>

          <div className="tools-showcase-grid">
            {/* Tool 1: Budget Planner */}
            <div className="tool-card">
              <div className="tool-icon-box" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <DollarSign size={28} />
              </div>
              <h3 className="tool-title">Smart Trip Budget Planner</h3>
              <p className="tool-desc">
                Calculate total and daily per-person expenses across flights, hotels, food, local transit, and activities with visual expense progress bars.
              </p>
              <Link to="/trip-planner" className="btn btn-outline btn-sm" style={{ marginTop: 'auto' }}>
                <span>Launch Budget Planner</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Tool 2: Multi-City Planner */}
            <div className="tool-card">
              <div className="tool-icon-box" style={{ background: 'var(--color-orange-light)', color: 'var(--color-orange)' }}>
                <Compass size={28} />
              </div>
              <h3 className="tool-title">Multi-City Hop-on Planner</h3>
              <p className="tool-desc">
                Build custom multi-leg itineraries (e.g., Mumbai → Singapore → Bangkok → Mumbai), reorder stops, view interactive timelines, and search individual legs.
              </p>
              <Link to="/multi-city" className="btn btn-outline btn-sm" style={{ marginTop: 'auto' }}>
                <span>Create Multi-City Route</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Tool 3: Currency Converter */}
            <div className="tool-card">
              <div className="tool-icon-box" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                <Globe2 size={28} />
              </div>
              <h3 className="tool-title">Global Currency Converter</h3>
              <p className="tool-desc">
                Convert fares and expenses across 10 world travel currencies (INR, USD, EUR, GBP, AED, SGD, THB, JPY, AUD, CAD) with live reference tables.
              </p>
              <Link to="/currency-converter" className="btn btn-outline btn-sm" style={{ marginTop: 'auto' }}>
                <span>Convert Currencies</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          6. Weekend Getaways (Short domestic escapes)
          -------------------------------------------------------------------- */}
      <section className="section-pad">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-primary section-badge">Short Breaks</span>
              <h2 className="section-title">Weekend Getaways</h2>
              <p className="section-subtitle">
                Quick 2–4 day breaks perfect for a refreshing weekend escape from major Indian cities.
              </p>
            </div>
            <Link to="/destinations?filter=India" className="btn btn-secondary btn-sm">
              <span>View All Indian Escapes</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="destinations-grid">
            {weekendGetaways.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          7. Budget-Friendly Trips
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-orange section-badge">Pocket Friendly</span>
              <h2 className="section-title">Budget-Friendly Trips</h2>
              <p className="section-subtitle">
                Incredible destinations that offer maximum culture, food, and sightseeing without breaking the bank.
              </p>
            </div>
            <Link to="/destinations" className="btn btn-secondary btn-sm">
              <span>Filter by Budget</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="destinations-grid">
            {budgetFriendlyTrips.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          8. Trending Destinations & Seasonal Trip Suggestions
          -------------------------------------------------------------------- */}
      <section className="section-pad">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-navy section-badge">Seasonal Picks</span>
              <h2 className="section-title">Trending Global Destinations</h2>
              <p className="section-subtitle">
                Iconic destinations currently experiencing ideal weather conditions and vibrant seasonal festivals.
              </p>
            </div>
            <Link to="/destinations" className="btn btn-outline btn-sm">
              <span>Explore All 69 Destinations</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="destinations-grid">
            {trendingDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          9. Three Simple Steps Section
          -------------------------------------------------------------------- */}
      <section className="section-pad" style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-orange section-badge">How It Works</span>
            <h2 className="section-title">Three Simple Steps to the Skies</h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Booking your simulated flight doesn’t need to be complex. We streamlined every touchpoint.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon-box">
                <Search size={30} />
              </div>
              <h3 className="step-title">Search Flights</h3>
              <p className="step-desc">
                Select your departure and arrival cities, toggle between Domestic and International, and pick preferred dates with validation.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon-box">
                <CheckCircle size={30} />
              </div>
              <h3 className="step-title">Compare & Select</h3>
              <p className="step-desc">
                Sort by cheapest, fastest, or earliest departure. Filter by airlines, cabin class, baggage allowance, and compare up to 3 flights side by side.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-box">
                <CreditCard size={30} />
              </div>
              <h3 className="step-title">Instant Booking</h3>
              <p className="step-desc">
                Choose your preferred seat on the visual cabin map, apply discount coupons, and generate your printable boarding pass with unique PNR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          10. Academic Project CTA Callout Banner
          -------------------------------------------------------------------- */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--color-bg-light)' }}>
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
                Ready to explore SkyLuxe?
              </h2>
              <p style={{ color: '#C0D5EE', maxWidth: '560px', margin: 0, lineHeight: 1.5 }}>
                Test our interactive domestic and international flight search, choose seats, simulate coupon discounts, and review complete booking itineraries.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/search" className="btn btn-orange btn-lg">
                <Plane size={18} />
                <span>Search Flights Now</span>
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                <span>Viva Q&A Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
