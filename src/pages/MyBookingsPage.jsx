import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Plane,
  Trash2,
  Eye,
  Calendar,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Clock,
  Printer,
  Tag,
  XCircle,
  CheckCircle2,
  Luggage,
  Search,
  RotateCcw,
  Globe
} from 'lucide-react';
import { getAirportByCode } from '../data/airports';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const navigate = useNavigate();

  // Load bookings safely from localStorage
  const loadBookings = () => {
    try {
      const stored = localStorage.getItem('skyluxe_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookings(Array.isArray(parsed) ? parsed : []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    }
  };

  useEffect(() => {
    loadBookings();
    window.addEventListener('skyluxe_booking_updated', loadBookings);
    return () => {
      window.removeEventListener('skyluxe_booking_updated', loadBookings);
    };
  }, []);

  // Cancel booking handler
  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;

    try {
      const updated = bookings.map((b) => {
        if (b.id === cancelModalBooking.id || b.bookingReference === cancelModalBooking.bookingReference) {
          return {
            ...b,
            status: 'CANCELLED (DEMO)',
            cancelledAt: new Date().toISOString()
          };
        }
        return b;
      });

      setBookings(updated);
      localStorage.setItem('skyluxe_bookings', JSON.stringify(updated));
      setCancelModalBooking(null);
      window.dispatchEvent(new Event('skyluxe_booking_updated'));
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  // Permanent Delete booking handler
  const handlePermanentDelete = (bookingId) => {
    try {
      const updated = bookings.filter((b) => b.id !== bookingId);
      setBookings(updated);
      localStorage.setItem('skyluxe_bookings', JSON.stringify(updated));
      window.dispatchEvent(new Event('skyluxe_booking_updated'));
    } catch (err) {
      console.error('Error deleting booking:', err);
    }
  };

  // Open confirmation page view for this booking
  const handleViewConfirmation = (b) => {
    navigate('/confirmation', { state: { booking: b } });
  };

  // Track status
  const handleTrackStatus = (b) => {
    navigate(`/flight-status?ref=${b.bookingReference}`);
  };

  // Filter Bookings by Tab and Search Reference
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    const isCancelled = b.status?.includes('CANCELLED');
    const flightDate = b.searchParams?.departureDate || b.bookedAt?.split('T')[0] || todayStr;

    // Tab filter
    if (filterTab === 'cancelled') {
      if (!isCancelled) return false;
    } else if (filterTab === 'upcoming') {
      if (isCancelled || flightDate < todayStr) return false;
    } else if (filterTab === 'completed') {
      if (isCancelled || flightDate >= todayStr) return false;
    }

    // Search query filter (PNR, Passenger Name, Cities, Airline)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const pnr = (b.bookingReference || b.id || '').toLowerCase();
      const name = (b.passenger?.fullName || '').toLowerCase();
      const airline = (b.flight?.airline || '').toLowerCase();
      const from = (b.flight?.fromCity || b.flight?.fromAirport || '').toLowerCase();
      const to = (b.flight?.toCity || b.flight?.toAirport || '').toLowerCase();

      const matches =
        pnr.includes(q) ||
        name.includes(q) ||
        airline.includes(q) ||
        from.includes(q) ||
        to.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="my-bookings-page section-pad" style={{ paddingTop: '36px' }}>
      <div className="container">
        {/* Page Title & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
              <BookmarkCheck size={14} />
              <span>Browser LocalStorage Persistence</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-navy)', margin: 0 }}>
              My Bookings
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
              Review, track, print, or cancel your simulated domestic and international flight reservations.
            </p>
          </div>

          <Link to="/search" className="btn btn-primary" id="book-new-flight-btn">
            <Plus size={18} />
            <span>Book Another Flight</span>
          </Link>
        </div>

        {/* Tab Filters & Search Bar Row */}
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`trip-pill ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All ({bookings.length})
            </button>
            <button
              type="button"
              className={`trip-pill ${filterTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilterTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`trip-pill ${filterTab === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterTab('completed')}
            >
              Completed Travels
            </button>
            <button
              type="button"
              className={`trip-pill ${filterTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilterTab('cancelled')}
            >
              Cancelled
            </button>
          </div>

          {/* Search by Reference or Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="text"
                className="field-input"
                placeholder="Search by PNR or name..."
                style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List of bookings */}
        {filteredBookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredBookings.map((item) => {
              // Backward compatible airport lookup
              const fromCode = item.flight?.fromAirport || 'BOM';
              const toCode = item.flight?.toAirport || 'DEL';
              const fromAirport = getAirportByCode(fromCode);
              const toAirport = getAirportByCode(toCode);
              const depDate = item.searchParams?.departureDate || 'Upcoming Date';
              const isCancelled = item.status?.includes('CANCELLED');
              const isDomestic = item.flight?.isDomestic ?? (fromAirport?.isDomestic && toAirport?.isDomestic);

              const seats = Array.isArray(item.passenger?.selectedSeats)
                ? item.passenger.selectedSeats.join(', ')
                : item.passenger?.selectedSeats || 'Standard 12A';

              const totalPrice = item.fareBreakdown?.totalPrice || item.flight?.price || 4200;

              return (
                <div key={item.id} className="my-booking-card" id={`booking-card-${item.id}`}>
                  {/* Airline & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '190px' }}>
                    <div
                      className="airline-logo-badge"
                      style={{
                        backgroundColor: item.flight?.airlineBgLight || '#EBF3FF',
                        color: item.flight?.airlineColor || 'var(--color-primary)'
                      }}
                    >
                      {item.flight?.airlineCode || 'SL'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', margin: '0 0 2px' }}>
                        {item.flight?.airline || 'SkyLuxe Airways'}
                      </h3>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <span
                          className={`badge ${isCancelled ? 'badge-orange' : 'badge-success'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {isCancelled ? 'Cancelled (Demo)' : 'Confirmed'}
                        </span>
                        <span className="badge" style={{ fontSize: '0.7rem', background: '#F1F5F9', color: '#475569' }}>
                          {isDomestic ? 'Domestic' : 'International'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route & Timing & Meta */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                      <span>{fromAirport.flag} {fromAirport.city} ({fromAirport.code})</span>
                      <ArrowRight size={18} color="var(--color-primary)" />
                      <span>{toAirport.flag} {toAirport.city} ({toAirport.code})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="var(--color-primary)" />
                        <span>{depDate}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} color="var(--color-navy)" />
                        <span>{item.passenger?.fullName || 'Demo Passenger'}</span>
                      </span>
                      <span>
                        Seat(s): <strong style={{ color: 'var(--color-primary)' }}>{seats}</strong>
                      </span>
                      <span style={{ color: 'var(--color-text-light)' }}>
                        PNR: <strong>{item.bookingReference}</strong>
                      </span>
                      {item.fareBreakdown?.appliedCoupon && (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          🏷️ {item.fareBreakdown.appliedCoupon?.code || item.fareBreakdown.appliedCoupon} (-₹{item.fareBreakdown.couponDiscountAmount})
                        </span>
                      )}
                    </div>

                    {/* Flight Times & Duration */}
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-navy)', display: 'flex', gap: '12px' }}>
                      <span>Dep: <strong>{item.flight?.departureTime}</strong> ({item.flight?.fromAirport})</span>
                      <span>Arr: <strong>{item.flight?.arrivalTime}</strong> ({item.flight?.toAirport})</span>
                      <span>Duration: <strong>{item.flight?.duration}</strong></span>
                    </div>
                  </div>

                  {/* Fare & Management Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '170px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* View & Print Boarding Pass */}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewConfirmation(item)}
                        title="View & Print Boarding Pass"
                      >
                        <Printer size={14} />
                        <span>Print</span>
                      </button>

                      {/* Track Flight */}
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleTrackStatus(item)}
                        title="Track flight status"
                      >
                        <Clock size={14} />
                        <span>Track</span>
                      </button>

                      {/* Cancel Booking (only if active) */}
                      {!isCancelled && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: '#E11D48', borderColor: '#FECDD3', background: '#FFF1F2' }}
                          onClick={() => setCancelModalBooking(item)}
                          title="Simulate cancellation"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Permanent Delete if already cancelled */}
                      {isCancelled && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
                          onClick={() => handlePermanentDelete(item.id)}
                          title="Remove from history"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
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
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              {searchQuery ? 'No matching bookings found' : 'No bookings in this category'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              {searchQuery
                ? `No flight booking matched "${searchQuery}". Please check your booking reference (PNR).`
                : 'You have no reservations under this filter. Search flights and confirm a simulated booking!'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {searchQuery && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSearchQuery('')}
                >
                  <RotateCcw size={15} />
                  <span>Clear Search</span>
                </button>
              )}
              <Link to="/search" className="btn btn-primary">
                <Search size={16} />
                <span>Find Flights Now</span>
              </Link>
            </div>
          </div>
        )}

        {/* Demo Cancellation Modal Confirmation */}
        {cancelModalBooking && (
          <div className="planner-modal-overlay" onClick={() => setCancelModalBooking(null)} role="dialog" aria-modal="true">
            <div
              className="planner-modal-container"
              style={{ maxWidth: '480px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '24px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <AlertCircle size={26} />
                </div>

                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                  Cancel Flight Booking?
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                  Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> ({cancelModalBooking.flight?.airline} {cancelModalBooking.flight?.fromAirport} → {cancelModalBooking.flight?.toAirport})?
                </p>

                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '20px', fontSize: '0.82rem', color: 'var(--color-navy)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Original Fare Paid:</span>
                    <span>₹{cancelModalBooking.fareBreakdown?.totalPrice?.toLocaleString('en-IN') || cancelModalBooking.flight?.price}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 600 }}>
                    <span>Estimated Demo Refund:</span>
                    <span>₹{cancelModalBooking.fareBreakdown?.estimatedRefund?.toLocaleString('en-IN') || Math.round((cancelModalBooking.fareBreakdown?.totalPrice || 4000) * 0.7).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCancelModalBooking(null)}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ background: '#DC2626', color: 'white' }}
                    onClick={handleConfirmCancel}
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
