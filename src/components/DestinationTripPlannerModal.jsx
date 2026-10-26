import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  Compass,
  MapPin,
  CheckCircle2,
  DollarSign,
  Plane,
  Heart,
  Sparkles,
  Info
} from 'lucide-react';

export default function DestinationTripPlannerModal({ destination, isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !destination) return null;

  const handleBookFlight = () => {
    onClose();
    const params = new URLSearchParams({
      from: 'BOM',
      to: destination.airportCode,
      tripType: 'oneWay',
      passengers: '1',
      cabinClass: 'Economy'
    });
    navigate(`/search?${params.toString()}`);
  };

  const { expenses = {}, itinerary = [], highlights = [] } = destination;
  const currentDayPlan = itinerary.find((item) => item.day === activeDay) || itinerary[0];

  return (
    <div className="planner-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="planner-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button
          className="planner-modal-close-btn"
          onClick={onClose}
          aria-label="Close trip planner"
        >
          <X size={20} />
        </button>

        {/* Hero Banner Header */}
        <div className="planner-modal-hero">
          {!imageError ? (
            <img
              src={destination.image}
              alt={destination.city}
              className="planner-modal-img"
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
                fontSize: '2rem',
                fontWeight: 800
              }}
            >
              {destination.city}
            </div>
          )}

          <div className="planner-modal-hero-gradient">
            <span className="badge badge-orange" style={{ marginBottom: '8px' }}>
              {destination.tag}
            </span>
            <h2 className="planner-modal-title">
              {destination.city}, {destination.country}
            </h2>
            <div className="planner-modal-meta-pills">
              <span className="planner-meta-pill">
                <Clock size={13} color="var(--color-orange)" />
                <span>Suggested: {destination.duration || '3 Days'}</span>
              </span>
              <span className="planner-meta-pill">
                <Calendar size={13} color="var(--color-primary)" />
                <span>Best: {destination.bestTime}</span>
              </span>
              <span className="planner-meta-pill">
                <Plane size={13} color="var(--color-success)" />
                <span>Airport: {destination.airportCode}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="planner-modal-body">
          {/* Overview Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              Destination Overview
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {destination.description}
            </p>
          </div>

          {/* 3 Recommended Attractions */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="var(--color-primary)" />
              <span>Recommended Attractions</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--color-bg-light)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: 'var(--color-navy)'
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested 3-Day Itinerary */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--color-orange)" />
                <span>Suggested 3-Day Itinerary</span>
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3].map((dayNum) => (
                  <button
                    key={dayNum}
                    type="button"
                    className={`sort-btn ${activeDay === dayNum ? 'active' : ''}`}
                    onClick={() => setActiveDay(dayNum)}
                    style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                  >
                    Day {dayNum}
                  </button>
                ))}
              </div>
            </div>

            {currentDayPlan && (
              <div
                style={{
                  background: 'white',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px 22px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    Day {currentDayPlan.day}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', margin: 0 }}>
                    {currentDayPlan.title}
                  </h4>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', margin: 0, lineHeight: '1.6' }}>
                  {currentDayPlan.desc}
                </p>
              </div>
            )}
          </div>

          {/* Estimated Expenses & Trip Budget Breakdown */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', margin: 0 }}>
                Estimated Trip Budget (3 Days)
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                *Suggested local estimates per person
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div className="expense-stat-card">
                <span className="expense-stat-label">🏨 Stay</span>
                <span className="expense-stat-value">₹{(expenses.accommodation || 4000).toLocaleString('en-IN')}</span>
              </div>
              <div className="expense-stat-card">
                <span className="expense-stat-label">🍽️ Dining</span>
                <span className="expense-stat-value">₹{(expenses.food || 2000).toLocaleString('en-IN')}</span>
              </div>
              <div className="expense-stat-card">
                <span className="expense-stat-label">🚕 Transit</span>
                <span className="expense-stat-value">₹{(expenses.transport || 1200).toLocaleString('en-IN')}</span>
              </div>
              <div className="expense-stat-card">
                <span className="expense-stat-label">🎟️ Sights</span>
                <span className="expense-stat-value">₹{(expenses.sightseeing || 800).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-navy) 0%, #173862 100%)',
                color: 'white',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B0C9E8' }}>
                  Total Estimated On-Ground Budget
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                  ₹{(destination.totalBudget || 8000).toLocaleString('en-IN')}
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#D0E3F8' }}>
                Flight fares extra starting from ₹{destination.priceFrom.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="planner-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            <span>Close Planner</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleBookFlight}
            id={`planner-search-flight-${destination.id}`}
          >
            <Plane size={18} />
            <span>Search Flights to {destination.city} ({destination.airportCode})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
