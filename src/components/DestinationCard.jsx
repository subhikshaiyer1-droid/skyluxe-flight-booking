import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Star, Calendar, Heart, Compass } from 'lucide-react';
import DestinationTripPlannerModal from './DestinationTripPlannerModal';

export default function DestinationCard({ destination, onWishlistChange = null }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  // Check if destination is in saved wishlist
  useEffect(() => {
    try {
      const stored = localStorage.getItem('skyluxe_saved_destinations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIsSaved(parsed.some((item) => item.id === destination.id));
        }
      }
    } catch {
      setIsSaved(false);
    }
  }, [destination.id]);

  // Toggle wishlist save
  const toggleWishlist = (e) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('skyluxe_saved_destinations');
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];

      if (isSaved) {
        list = list.filter((item) => item.id !== destination.id);
        setIsSaved(false);
      } else {
        list.push(destination);
        setIsSaved(true);
      }

      localStorage.setItem('skyluxe_saved_destinations', JSON.stringify(list));
      window.dispatchEvent(new Event('skyluxe_saved_updated'));
      if (onWishlistChange) onWishlistChange();
    } catch (err) {
      console.warn('Error updating saved destinations:', err);
    }
  };

  const handleBookFlight = (e) => {
    e.stopPropagation();
    const params = new URLSearchParams({
      from: 'BOM',
      to: destination.airportCode,
      tripType: 'oneWay',
      passengers: '1',
      cabinClass: 'Economy'
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <>
      <div className="dest-card" id={`destination-${destination.id}`}>
        {/* Image with Tag & Price Badge & Wishlist Heart */}
        <div className="dest-image-wrap">
          {!imageError ? (
            <img
              src={destination.image}
              alt={`${destination.city}, ${destination.country}`}
              className="dest-img"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: destination.fallbackColor || 'linear-gradient(135deg, #183153 0%, #2684FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.4rem',
                fontWeight: 800
              }}
            >
              {destination.city}
            </div>
          )}

          <span className="dest-tag-badge">{destination.tag}</span>

          {/* Wishlist Heart Button */}
          <button
            type="button"
            className={`dest-heart-btn ${isSaved ? 'is-saved' : ''}`}
            onClick={toggleWishlist}
            aria-label={isSaved ? `Remove ${destination.city} from saved items` : `Save ${destination.city} to wishlist`}
            title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
          >
            <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : 'white'} />
          </button>

          <span className="dest-price-badge">
            From <span>₹{destination.priceFrom.toLocaleString('en-IN')}</span>
          </span>
        </div>

        {/* Body Content */}
        <div className="dest-body">
          <div className="dest-header">
            <div>
              <h3 className="dest-city">{destination.city}</h3>
              <span className="dest-country">{destination.country} • {destination.airportCode}</span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-navy)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={14} fill="#FF9F43" color="#FF9F43" /> {destination.rating}
            </span>
          </div>

          <p className="dest-desc">{destination.description}</p>

          {/* Highlights Pills */}
          {destination.highlights && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {destination.highlights.slice(0, 3).map((highlight, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg-light)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 500
                  }}
                >
                  • {highlight}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons: Plan Trip & Search Flights */}
          <div className="dest-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsPlannerOpen(true)}
              title="View 3-day itinerary and estimated budget"
            >
              <Compass size={14} />
              <span>Trip Planner</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleBookFlight}
              id={`book-flight-${destination.id}`}
              title={`Search flights to ${destination.city}`}
            >
              <span>Search Flights</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Planner Itinerary & Budget Modal */}
      <DestinationTripPlannerModal
        destination={destination}
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
    </>
  );
}
