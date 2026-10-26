import React, { useState, useEffect } from 'react';
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
  Bookmark
} from 'lucide-react';
import DestinationCard from '../components/DestinationCard';

export default function SavedItemsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'flights'
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [savedFlights, setSavedFlights] = useState([]);

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

  return (
    <div className="section-pad" style={{ paddingTop: '40px' }}>
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

          {/* Tab Selector */}
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

        {/* Tab 1: Saved Destinations */}
        {activeTab === 'destinations' && (
          <div>
            {savedDestinations.length > 0 ? (
              <div className="destinations-grid">
                {savedDestinations.map((dest) => (
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
                  No Saved Destinations Yet
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Click the heart icon on any destination card to save it to your personal travel wishlist for later!
                </p>
                <Link to="/destinations" className="btn btn-primary">
                  <Compass size={16} />
                  <span>Browse All 44+ Destinations</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Flights */}
        {activeTab === 'flights' && (
          <div>
            {savedFlights.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {savedFlights.map((flight) => (
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
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flight-timeline">
                      <div className="timeline-point">
                        <div className="timeline-time">{flight.departureTime}</div>
                        <div className="timeline-city">{flight.fromAirport}</div>
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
                        <div className="timeline-time">{flight.arrivalTime}</div>
                        <div className="timeline-city">{flight.toAirport}</div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flight-price-box">
                      <div className="flight-price-amount">
                        ₹{flight.price.toLocaleString('en-IN')}
                      </div>
                      <div className="flight-price-subtext">Base demo fare per passenger</div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                          onClick={() => handleRemoveFlight(flight.id)}
                          title="Remove from saved flights"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleBookSavedFlight(flight)}
                        >
                          <span>Select & Book</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
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
                  <Plane size={32} color="var(--color-primary)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                  No Saved Flights Yet
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                  When searching for flights, click the heart icon on any flight card to bookmark it here for easy comparison and booking.
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
