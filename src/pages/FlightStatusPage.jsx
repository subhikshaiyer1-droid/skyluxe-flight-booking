import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Clock,
  Search,
  Plane,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Luggage,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { getAirportByCode } from '../data/airports';

export default function FlightStatusPage() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';

  const [searchInput, setSearchInput] = useState(initialRef);
  const [activeResult, setActiveResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [savedBookings, setSavedBookings] = useState([]);

  // Load existing bookings from localStorage to populate quick-select chips
  useEffect(() => {
    try {
      const stored = localStorage.getItem('skyluxe_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedBookings(parsed);
          // If initialRef is provided, lookup immediately
          if (initialRef) {
            lookupFlight(initialRef, parsed);
          }
        }
      }
    } catch (err) {
      console.warn('Error reading bookings:', err);
    }
  }, [initialRef]);

  const lookupFlight = (refQuery, bookingsList = savedBookings) => {
    const q = refQuery.trim().toUpperCase();
    if (!q) return;

    // Check if matches a booking in localStorage
    const matchedBooking = bookingsList.find(
      (b) => b.bookingReference?.toUpperCase() === q || b.id?.toUpperCase() === q
    );

    if (matchedBooking) {
      setNotFound(false);
      setActiveResult({
        type: 'booking',
        data: matchedBooking,
        simulatedStage: determineStage(matchedBooking)
      });
      return;
    }

    // Fallback: check if matches generic flight number format (e.g. 6E-204, AI-102, EK-501)
    if (q.includes('-') || q.length >= 4) {
      setNotFound(false);
      setActiveResult({
        type: 'flightNumber',
        flightNumber: q,
        simulatedStage: 3, // In-Air
        data: {
          flight: {
            airline: 'SkyLuxe Partner Airline',
            airlineCode: q.slice(0, 2),
            flightNumber: q,
            fromAirport: 'BOM',
            toAirport: 'DEL',
            departureTime: '10:30',
            arrivalTime: '12:45',
            duration: '2h 15m',
            aircraft: 'Airbus A320neo'
          },
          status: 'IN AIR'
        }
      });
      return;
    }

    // Not found
    setNotFound(true);
    setActiveResult(null);
  };

  const determineStage = (booking) => {
    if (booking.status === 'CANCELLED') return -1;
    // Simulate flight stage
    const lastDigit = parseInt(booking.bookingReference.slice(-1), 10) || 5;
    if (lastDigit < 3) return 1; // Check-in Open
    if (lastDigit < 6) return 2; // Boarding
    if (lastDigit < 8) return 3; // Departed / In Air
    return 4; // Arrived
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    lookupFlight(searchInput);
  };

  const stages = [
    { id: 0, label: 'Scheduled', desc: 'Flight confirmed on time' },
    { id: 1, label: 'Check-in Open', desc: 'Baggage counters active' },
    { id: 2, label: 'Boarding', desc: 'Gate T2-B14 open' },
    { id: 3, label: 'Departed', desc: 'Cruising at 34,000 ft' },
    { id: 4, label: 'Arrived', desc: 'Landed at destination' }
  ];

  return (
    <div className="section-pad" style={{ paddingTop: '40px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="badge badge-primary section-badge">
            <Clock size={14} />
            <span>Flight Tracker Simulation</span>
          </span>
          <h1 className="section-title">Track Demo Flight Status</h1>
          <p className="section-subtitle">
            Enter your demo booking reference (PNR) or flight number to view live simulated operational updates.
          </p>
        </div>

        {/* Search Card */}
        <div className="card" style={{ padding: '28px', marginBottom: '32px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                className="field-input"
                placeholder="Enter Booking Reference (e.g. SLX-748921) or Flight # (e.g. 6E-204)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  background: 'var(--color-bg-light)',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
              <Search size={18} />
              <span>Track Flight</span>
            </button>
          </form>

          {/* Quick chips of saved bookings */}
          {savedBookings.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                Your Bookings:
              </span>
              {savedBookings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="badge badge-primary"
                  onClick={() => {
                    setSearchInput(b.bookingReference);
                    lookupFlight(b.bookingReference);
                  }}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {b.bookingReference} ({b.flight?.fromAirport} → {b.flight?.toAirport})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Demo Notice */}
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#92400E' }}>
          <Info size={16} color="#D97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Simulated Status:</strong> All stages, baggage carousels, and departure timers are deterministic mock data for college presentation purposes.
          </span>
        </div>

        {/* Active Result View */}
        {activeResult && (
          <div className="card" style={{ padding: '32px', border: '1.5px solid var(--color-border)' }}>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '6px' }}>
                  Live Status • On Time
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', margin: 0 }}>
                  {activeResult.data.flight?.airline} #{activeResult.data.flight?.flightNumber}
                </h2>
                {activeResult.data.bookingReference && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Passenger: <strong>{activeResult.data.passenger?.fullName}</strong> • PNR: <strong>{activeResult.data.bookingReference}</strong>
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>
                  Assigned Gate
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  Gate T2 - 18B
                </div>
              </div>
            </div>

            {/* Route Timeline */}
            <div style={{
              background: 'var(--color-bg-light)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px'
            }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {activeResult.data.flight?.departureTime}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {activeResult.data.flight?.fromAirport}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {getAirportByCode(activeResult.data.flight?.fromAirport)?.city}
                </div>
              </div>

              <div style={{ flex: 1, padding: '0 24px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {activeResult.data.flight?.duration}
                </span>
                <div style={{ height: '2px', background: 'var(--color-border)', position: 'relative', margin: '6px 0' }}>
                  <Plane
                    size={16}
                    color="var(--color-primary)"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      background: 'var(--color-bg-light)',
                      padding: '0 2px'
                    }}
                  />
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {activeResult.data.flight?.stopDetails || 'Non-stop'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {activeResult.data.flight?.arrivalTime}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {activeResult.data.flight?.toAirport}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {getAirportByCode(activeResult.data.flight?.toAirport)?.city}
                </div>
              </div>
            </div>

            {/* Simulated Status Progress Bar */}
            <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', marginBottom: '16px' }}>
              Flight Progress Timeline
            </h3>

            <div className="status-progress-track">
              {stages.map((stage, idx) => {
                const isCompleted = idx < activeResult.simulatedStage;
                const isCurrent = idx === activeResult.simulatedStage;

                return (
                  <div key={stage.id} className="status-step-node">
                    <div className={`status-node-circle ${isCompleted ? 'is-completed' : isCurrent ? 'is-current' : ''}`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                    </div>
                    <span className="status-node-label">{stage.label}</span>
                    <span className="status-node-subtext">{stage.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Baggage Belt</span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>Carousel 04</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Aircraft</span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{activeResult.data.flight?.aircraft || 'Airbus A320neo'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Seat(s)</span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                  {Array.isArray(activeResult.data.passenger?.selectedSeats)
                    ? activeResult.data.passenger?.selectedSeats.join(', ')
                    : '12A'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Cabin Class</span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{activeResult.data.flight?.cabinClass || 'Economy'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Not Found View */}
        {notFound && (
          <div className="empty-results-card">
            <AlertCircle size={40} color="#EF4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              Booking Reference Not Found
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              We could not find any saved booking matching "{searchInput}". Please double check your 6-digit PNR reference in your confirmation email or My Bookings.
            </p>
            <Link to="/my-bookings" className="btn btn-secondary btn-sm">
              <span>View My Saved Bookings</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
