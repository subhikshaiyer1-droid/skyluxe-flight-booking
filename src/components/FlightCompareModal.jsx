import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Check,
  Plane,
  Clock,
  Luggage,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function FlightCompareModal({
  isOpen,
  onClose,
  flights = [],
  searchParams = {},
  onRemoveFlight
}) {
  const navigate = useNavigate();

  if (!isOpen || flights.length === 0) return null;

  const passengerCount = Number(searchParams.passengers || 1);

  // Identify min price and min duration among the compared flights
  const minPrice = Math.min(...flights.map((f) => f.price));
  const minDuration = Math.min(...flights.map((f) => f.durationMinutes));

  const handleSelectFlight = (flight) => {
    onClose();
    navigate('/booking', {
      state: {
        flight,
        searchParams
      }
    });
  };

  return (
    <div className="planner-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="planner-modal-container"
        style={{ maxWidth: '960px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-light)'
        }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
              Side-by-Side Analysis
            </span>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-navy)', margin: 0 }}>
              Flight Comparison ({flights.length} of 3 selected)
            </h2>
          </div>

          <button
            className="planner-modal-close-btn"
            style={{ position: 'static' }}
            onClick={onClose}
            aria-label="Close comparison"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div style={{ padding: '28px', overflowX: 'auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `160px repeat(${flights.length}, minmax(220px, 1fr))`,
              gap: '16px',
              minWidth: flights.length > 2 ? '780px' : 'auto'
            }}
          >
            {/* Row 1: Header / Airline */}
            <div style={{ fontWeight: 700, color: 'var(--color-navy)', paddingTop: '12px' }}>
              Airline & Flight
            </div>
            {flights.map((flight) => (
              <div
                key={flight.id}
                style={{
                  background: 'var(--color-bg-light)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
              >
                <button
                  type="button"
                  onClick={() => onRemoveFlight(flight.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    color: 'var(--color-text-light)',
                    padding: '4px'
                  }}
                  title="Remove from comparison"
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    className="airline-logo-badge"
                    style={{
                      width: '36px',
                      height: '36px',
                      fontSize: '0.85rem',
                      backgroundColor: flight.airlineBgLight,
                      color: flight.airlineColor
                    }}
                  >
                    {flight.airlineCode}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--color-navy)', margin: 0 }}>
                      {flight.airline}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                      #{flight.flightNumber}
                    </span>
                  </div>
                </div>

                {flight.price === minPrice && (
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    <TrendingDown size={11} /> Lowest Price
                  </span>
                )}
                {flight.durationMinutes === minDuration && (
                  <span className="badge badge-orange" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>
                    <Zap size={11} /> Fastest
                  </span>
                )}
              </div>
            ))}

            {/* Row 2: Price */}
            <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              Ticket Price
            </div>
            {flights.map((flight) => {
              const isBestPrice = flight.price === minPrice;
              return (
                <div
                  key={`price-${flight.id}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isBestPrice ? 'var(--color-success-bg)' : 'white',
                    border: isBestPrice ? '1px solid #A7F3D0' : '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isBestPrice ? '#047857' : 'var(--color-navy)' }}>
                    ₹{(flight.price * passengerCount).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ₹{flight.price.toLocaleString('en-IN')} per adult
                  </div>
                </div>
              );
            })}

            {/* Row 3: Timings */}
            <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              Departure & Arrival
            </div>
            {flights.map((flight) => (
              <div
                key={`time-${flight.id}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
                  {flight.departureTime} → {flight.arrivalTime} {flight.isNextDay && <sup style={{ color: 'var(--color-orange)' }}>+1</sup>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {flight.fromAirport} to {flight.toAirport}
                </div>
              </div>
            ))}

            {/* Row 4: Duration */}
            <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              Total Duration
            </div>
            {flights.map((flight) => {
              const isFastest = flight.durationMinutes === minDuration;
              return (
                <div
                  key={`dur-${flight.id}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isFastest ? 'var(--color-orange-light)' : 'white',
                    border: isFastest ? '1px solid #FED7AA' : '1px solid var(--color-border-subtle)'
                  }}
                >
                  <div style={{ fontWeight: 700, color: isFastest ? '#C2410C' : 'var(--color-navy)' }}>
                    {flight.duration}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {flight.stopDetails}
                  </div>
                </div>
              );
            })}

            {/* Row 5: Baggage */}
            <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              Baggage
            </div>
            {flights.map((flight) => (
              <div
                key={`bag-${flight.id}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '0.85rem',
                  color: 'var(--color-navy)'
                }}
              >
                <Luggage size={14} color="var(--color-primary)" style={{ display: 'inline', marginRight: '6px' }} />
                <span>{flight.baggage}</span>
              </div>
            ))}

            {/* Row 6: Aircraft & Amenities */}
            <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
              Amenities
            </div>
            {flights.map((flight) => (
              <div
                key={`amen-${flight.id}`}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'white',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: '1.5'
                }}
              >
                <div>✈️ {flight.aircraft}</div>
                {flight.amenities && (
                  <div style={{ marginTop: '4px', color: 'var(--color-navy)', fontWeight: 500 }}>
                    • {flight.amenities.join(', ')}
                  </div>
                )}
              </div>
            ))}

            {/* Row 7: Action */}
            <div></div>
            {flights.map((flight) => (
              <div key={`act-${flight.id}`} style={{ paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleSelectFlight(flight)}
                >
                  <span>Select & Book</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance Note */}
        <div style={{
          padding: '16px 28px',
          background: 'var(--color-bg-light)',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)'
        }}>
          <AlertCircle size={15} color="var(--color-primary)" />
          <span>
            Fares are simulated demo quotes. Comparing allows you to weigh non-stop travel time vs layover fare savings before booking.
          </span>
        </div>
      </div>
    </div>
  );
}
