import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Clock,
  Luggage,
  Utensils,
  Zap,
  ShieldCheck,
  Heart,
  CheckSquare,
  Square,
  TrendingDown,
  Sparkles
} from 'lucide-react';

export default function FlightCard({
  flight,
  searchParams = {},
  isCheapest = false,
  isFastest = false,
  isCompared = false,
  onToggleCompare = null,
  onWishlistChange = null
}) {
  const navigate = useNavigate();
  const passengerCount = Number(searchParams.passengers || 1);
  const totalFlightPrice = flight.price * passengerCount;

  // Check if flight is saved in wishlist
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('skyluxe_saved_flights');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIsSaved(parsed.some((f) => f.id === flight.id));
        }
      }
    } catch {
      setIsSaved(false);
    }
  }, [flight.id]);

  const toggleSaveFlight = (e) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('skyluxe_saved_flights');
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (isSaved) {
        list = list.filter((f) => f.id !== flight.id);
        setIsSaved(false);
      } else {
        list.push({
          ...flight,
          savedAt: new Date().toISOString(),
          searchParams
        });
        setIsSaved(true);
      }

      localStorage.setItem('skyluxe_saved_flights', JSON.stringify(list));
      window.dispatchEvent(new Event('skyluxe_saved_updated'));
      if (onWishlistChange) onWishlistChange();
    } catch (err) {
      console.warn('Error saving flight:', err);
    }
  };

  const handleSelectFlight = () => {
    navigate('/booking', {
      state: {
        flight,
        searchParams
      }
    });
  };

  return (
    <div className={`flight-card ${isCompared ? 'flight-card-compared' : ''}`} id={`flight-${flight.id}`}>
      {/* Top Banner Badges (Cheapest / Fastest) */}
      {(isCheapest || isFastest) && (
        <div style={{
          position: 'absolute',
          top: '-11px',
          left: '24px',
          display: 'flex',
          gap: '6px',
          zIndex: 2
        }}>
          {isCheapest && (
            <span className="badge badge-success" style={{ boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)' }}>
              <TrendingDown size={12} /> Lowest Fare
            </span>
          )}
          {isFastest && (
            <span className="badge badge-orange" style={{ boxShadow: '0 2px 6px rgba(255, 159, 67, 0.3)' }}>
              <Zap size={12} /> Fastest Route
            </span>
          )}
        </div>
      )}

      {/* Airline Info */}
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
          <span className="flight-number">{flight.flightNumber} • {flight.aircraft}</span>
        </div>
      </div>

      {/* Flight Timeline & Stops */}
      <div className="flight-timeline">
        {/* Departure */}
        <div className="timeline-point">
          <div className="timeline-time">{flight.departureTime}</div>
          <div className="timeline-city">{flight.fromAirport}</div>
        </div>

        {/* Path & Duration */}
        <div className="timeline-path">
          <span className="flight-duration-text">{flight.duration}</span>
          <div className="timeline-line">
            <span className="timeline-plane-icon">
              <Plane size={15} style={{ transform: 'rotate(90deg)' }} />
            </span>
          </div>
          <span
            className={`badge flight-stop-badge ${
              flight.stops === 0 ? 'badge-primary' : 'badge-orange'
            }`}
          >
            {flight.stopDetails}
          </span>
        </div>

        {/* Arrival */}
        <div className="timeline-point">
          <div className="timeline-time">
            {flight.arrivalTime}
            {flight.isNextDay && (
              <sup style={{ fontSize: '0.65rem', color: 'var(--color-orange)', marginLeft: '2px' }}>
                +1
              </sup>
            )}
          </div>
          <div className="timeline-city">{flight.toAirport}</div>
        </div>
      </div>

      {/* Pricing, Compare & Booking CTA */}
      <div className="flight-price-box">
        <div className="flight-price-amount">
          ₹{totalFlightPrice.toLocaleString('en-IN')}
        </div>
        <div className="flight-price-subtext">
          {passengerCount > 1
            ? `₹${flight.price.toLocaleString('en-IN')} × ${passengerCount} passengers`
            : 'Per adult, all taxes included'}
        </div>

        <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleSaveFlight}
            style={{
              padding: '8px 10px',
              color: isSaved ? '#EF4444' : 'var(--color-text-muted)',
              borderColor: isSaved ? '#FCA5A5' : 'var(--color-border)'
            }}
            title={isSaved ? 'Remove from saved flights' : 'Save flight to wishlist'}
            aria-label="Save flight"
          >
            <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} />
          </button>

          {/* Select Flight Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSelectFlight}
            id={`select-flight-${flight.id}`}
            style={{ flex: 1 }}
          >
            <span>Select Flight</span>
          </button>
        </div>

        {/* Compare Checkbox */}
        {onToggleCompare && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: isCompared ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(flight)}
              style={{ display: 'none' }}
            />
            {isCompared ? (
              <CheckSquare size={14} color="var(--color-primary)" />
            ) : (
              <Square size={14} color="var(--color-text-light)" />
            )}
            <span>{isCompared ? 'Added to Compare' : 'Compare flight'}</span>
          </label>
        )}

        {flight.seatsAvailable <= 4 && (
          <span style={{ fontSize: '0.73rem', color: '#E11D48', fontWeight: 600 }}>
            Only {flight.seatsAvailable} seats remaining!
          </span>
        )}
      </div>

      {/* Amenities & Baggage Bar */}
      <div className="flight-amenities-row">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Luggage size={14} color="var(--color-primary)" /> {flight.baggage}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Utensils size={14} color="var(--color-orange)" />
          {flight.amenities ? flight.amenities[0] : 'In-flight service'}
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.76rem' }}>
          <ShieldCheck size={14} /> Free Rescheduling within 24h
        </span>
      </div>
    </div>
  );
}
