import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Plane,
  MapPin,
  Trash2,
  ArrowRight,
  Compass,
  Calendar,
  Luggage,
  Sparkles,
  Bookmark,
  Globe,
  Tag
} from 'lucide-react';
import DestinationCard from '../components/DestinationCard';
import { isDomesticRoute, getAirportByCode } from '../data/airports';

export default function SavedItemsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'flights'
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [savedFlights, setSavedFlights] = useState([]);

  // Sub-filter for destinations: 'All' | 'India' | 'Asia' | 'Europe' | 'Middle East' | 'North America' | 'South America' | 'Africa' | 'Oceania'
  const [destRegionFilter, setDestRegionFilter] = useState('All');

  // Sub-filter for saved flights: 'all' | 'domestic' | 'international'
  const [flightTypeFilter, setFlightTypeFilter] = useState('all');

  const loadSavedItems = () => {
    try {
      const storedDests = localStorage.getItem('skyluxe_saved_destinations');
      if (storedDests) {
        const parsed = JSON.parse(storedDests);
        setSavedDestinations(Array.isArray(parsed) ? parsed : []);
      } else {
        setSavedDestinations([]);
      }

      const storedFlights = localStorage.getItem('skyluxe_saved_flights');
      if (storedFlights) {
        const parsedF = JSON.parse(storedFlights);
        setSavedFlights(Array.isArray(parsedF) ? parsedF : []);
      } else {
        setSavedFlights([]);
      }
    } catch (err) {
      console.warn('Error reading saved items:', err);
    }
  };

  useEffect(() => {
    loadSavedItems();
    window.addEventListener('skyluxe_saved_updated', loadSavedItems);
    return () => {
      window.removeEventListener('skyluxe_saved_updated', loadSavedItems);
    };
  }, []);

  const handleRemoveFlight = (flightId) => {
    try {
      const updated = savedFlights.filter((f) => f.id !== flightId);
      setSavedFlights(updated);
      localStorage.setItem('skyluxe_saved_flights', JSON.stringify(updated));
      window.dispatchEvent(new Event('skyluxe_saved_updated'));
    } catch (err) {
      console.warn('Error removing saved flight:', err);
    }
  };

  const handleBookSavedFlight = (flight) => {
    navigate('/booking', {
      state: {
        flight,
        searchParams: flight.searchParams || {
          from: flight.fromAirport,
          to: flight.toAirport,
          departureDate: new Date().toISOString().split('T')[0],
          passengers: 1,
          cabinClass: flight.cabinClass || 'Economy'
        }
      }
    });
  };

  // Filtered Saved Destinations by Region
  const filteredSavedDestinations = useMemo(() => {
    if (destRegionFilter === 'All') return savedDestinations;
    return savedDestinations.filter(
      (d) => (d.region || (d.country === 'India' ? 'India' : 'International')).toLowerCase() === destRegionFilter.toLowerCase()
    );
  }, [savedDestinations, destRegionFilter]);

  // Filtered Saved Flights by Domestic vs International
  const filteredSavedFlights = useMemo(() => {
    return savedFlights.filter((flight) => {
      const isDom = flight.isDomestic ?? isDomesticRoute(flight.fromAirport, flight.toAirport);
      if (flightTypeFilter === 'domestic') return isDom;
      if (flightTypeFilter === 'international') return !isDom;
      return true;
    });
  }, [savedFlights, flightTypeFilter]);

  // Unique regions present in saved destinations
  const availableRegions = useMemo(() => {
    const set = new Set();
    savedDestinations.forEach((d) => {
      if (d.region) set.add(d.region);
      else if (d.country === 'India') set.add('India');
    });
    return Array.from(set);
  }, [savedDestinations]);

  return (
    <div className="section-pad" style={{ paddingTop: '36px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-orange" style={{ marginBottom: '8px' }}>
              <Heart size={13} fill="var(--color-orange)" />
              <span>Wishlist & Bookmarks</span>
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              Saved Wishlist
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
              Your saved holiday destinations and bookmarked flights stored safely in your browser.
            </p>
          </div>

          {/* Primary Tab Selector */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--color-white)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              type="button"
              className={`trip-pill ${activeTab === 'destinations' ? 'active' : ''}`}
              onClick={() => setActiveTab('destinations')}
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Compass size={16} />
              <span>Destinations ({savedDestinations.length})</span>
            </button>
            <button
              type="button"
              className={`trip-pill ${activeTab === 'flights' ? 'active' : ''}`}
              onClick={() => setActiveTab('flights')}
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <Plane size={16} />
              <span>Flights ({savedFlights.length})</span>
            </button>
          </div>
        </div>

        {/* ================================================================
            TAB 1: SAVED DESTINATIONS (with Region Grouping)
            ================================================================ */}
        {activeTab === 'destinations' && (
          <div>
            {savedDestinations.length > 0 && availableRegions.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`trip-pill ${destRegionFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setDestRegionFilter('All')}
                >
                  All Regions ({savedDestinations.length})
                </button>
                {availableRegions.map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    className={`trip-pill ${destRegionFilter === reg ? 'active' : ''}`}
                    onClick={() => setDestRegionFilter(reg)}
                  >
                    {reg === 'India' ? '🇮🇳 India' : reg}
                  </button>
                ))}
              </div>
            )}

            {filteredSavedDestinations.length > 0 ? (
              <div className="destinations-grid">
                {filteredSavedDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onWishlistChange={loadSavedItems}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-results-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Heart size={32} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                  {savedDestinations.length === 0 ? 'No Saved Destinations Yet' : 'No destinations in this region'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                  {savedDestinations.length === 0
                    ? 'Click the heart icon on any destination card to save it to your personal travel wishlist for later!'
                    : 'Try selecting All Regions to see all your saved getaway spots.'}
                </p>
                <Link to="/destinations" className="btn btn-primary">
                  <Compass size={16} />
                  <span>Browse Destination Catalogue</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            TAB 2: SAVED FLIGHTS (Separating Domestic vs International)
            ================================================================ */}
        {activeTab === 'flights' && (
          <div>
            {savedFlights.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`trip-pill ${flightTypeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setFlightTypeFilter('all')}
                >
                  All Saved Flights ({savedFlights.length})
                </button>
                <button
                  type="button"
                  className={`trip-pill ${flightTypeFilter === 'domestic' ? 'active' : ''}`}
                  onClick={() => setFlightTypeFilter('domestic')}
                >
                  🇮🇳 Domestic Flights
                </button>
                <button
                  type="button"
                  className={`trip-pill ${flightTypeFilter === 'international' ? 'active' : ''}`}
                  onClick={() => setFlightTypeFilter('international')}
                >
                  🌐 International Flights
                </button>
              </div>
            )}

            {filteredSavedFlights.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredSavedFlights.map((flight) => {
                  const isDom = flight.isDomestic ?? isDomesticRoute(flight.fromAirport, flight.toAirport);
                  const fromAirport = getAirportByCode(flight.fromAirport);
                  const toAirport = getAirportByCode(flight.toAirport);

                  return (
                    <div key={flight.id} className="flight-card">
                      {/* Airline */}
                      <div className="flight-airline-info">
                        <div
                          className="airline-logo-badge"
                          style={{
                            backgroundColor: flight.airlineBgLight || '#EBF3FF',
                            color: flight.airlineColor || 'var(--color-primary)'
                          }}
                        >
                          {flight.airlineCode}
                        </div>
                        <div>
                          <h4 className="airline-name">{flight.airline}</h4>
                          <span className="flight-number">{flight.flightNumber} • {flight.cabinClass || 'Economy'}</span>
                          <span
                            className="badge"
                            style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              fontSize: '0.68rem',
                              background: isDom ? '#E8F1FC' : '#F3E8FF',
                              color: isDom ? 'var(--color-primary)' : '#6B21A8'
                            }}
                          >
                            {isDom ? 'Domestic India' : 'International'}
                          </span>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flight-timeline">
                        <div className="timeline-point">
                          <div className="timeline-time">{flight.departureTime}</div>
                          <div className="timeline-city">{fromAirport.city} ({fromAirport.code})</div>
                        </div>
                        <div className="timeline-path">
                          <span className="flight-duration-text">{flight.duration}</span>
                          <div className="timeline-line">
                            <span className="timeline-plane-icon">
                              <Plane size={15} style={{ transform: 'rotate(90deg)' }} />
                            </span>
                          </div>
                          <span className="badge badge-primary flight-stop-badge">
                            {flight.stopDetails}
                          </span>
                        </div>
                        <div className="timeline-point">
                          <div className="timeline-time">
                            {flight.arrivalTime}
                            {flight.isNextDay && <sup style={{ color: 'var(--color-orange)' }}>+1</sup>}
                          </div>
                          <div className="timeline-city">{toAirport.city} ({toAirport.code})</div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flight-price-box">
                        <div className="flight-price-amount">
                          ₹{flight.price.toLocaleString('en-IN')}
                        </div>
                        <div className="flight-price-subtext">Estimated fare per adult</div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleRemoveFlight(flight.id)}
                            style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                            title="Remove from saved flights"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleBookSavedFlight(flight)}
                          >
                            <span>Book Flight</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-results-card">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Plane size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                  {savedFlights.length === 0 ? 'No Saved Flights Yet' : 'No flights in this category'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                  {savedFlights.length === 0
                    ? 'Search flights and tap the heart icon on any card to save it here for quick access later.'
                    : 'Try viewing All Saved Flights to review your bookmarks.'}
                </p>
                <Link to="/search" className="btn btn-primary">
                  <Plane size={16} />
                  <span>Search Flights</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
