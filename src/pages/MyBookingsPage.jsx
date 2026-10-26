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
  Luggage
} from 'lucide-react';
import { getAirportByCode } from '../data/airports';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'upcoming' | 'past' | 'cancelled'
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const navigate = useNavigate();

  // Load bookings from localStorage
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
        if (b.id === cancelModalBooking.id) {
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
      // Notify components like Navbar
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

  // Filter Bookings by Tab
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    const isCancelled = b.status?.includes('CANCELLED');
    const flightDate = b.searchParams?.departureDate || todayStr;

    if (filterTab === 'cancelled') {
      return isCancelled;
    }
    if (filterTab === 'upcoming') {
      return !isCancelled && flightDate >= todayStr;
    }
    if (filterTab === 'past') {
      return !isCancelled && flightDate < todayStr;
    }
    return true; // 'all'
  });

  return (
    <div className="my-bookings-page">
      <div className="container">
        {/* Page Title & Stats */}
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
              Manage, review, track, or cancel your simulated flight reservations.
            </p>
          </div>

          <Link to="/search" className="btn btn-primary" id="book-new-flight-btn">
            <Plus size={18} />
            <span>Book Another Flight</span>
          </Link>
        </div>

        {/* Tab Filters: All, Upcoming, Past, Cancelled */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`trip-pill ${filterTab === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTab('all')}
          >
            All Bookings ({bookings.length})
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
            className={`trip-pill ${filterTab === 'past' ? 'active' : ''}`}
            onClick={() => setFilterTab('past')}
          >
            Past Travels
          </button>
          <button
            type="button"
            className={`trip-pill ${filterTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilterTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* List of bookings */}
        {filteredBookings.length > 0 ? (
          <div>
            {filteredBookings.map((item) => {
              const fromAirport = getAirportByCode(item.flight.fromAirport);
              const toAirport = getAirportByCode(item.flight.toAirport);
              const depDate = item.searchParams?.departureDate || 'Upcoming Date';
              const isCancelled = item.status?.includes('CANCELLED');
              const seats = Array.isArray(item.passenger?.selectedSeats)
                ? item.passenger.selectedSeats.join(', ')
                : item.passenger?.selectedSeats || 'Standard 12A';

              return (
                <div key={item.id} className="my-booking-card" id={`booking-card-${item.id}`}>
                  {/* Airline & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px' }}>
                    <div
                      className="airline-logo-badge"
                      style={{
                        backgroundColor: item.flight.airlineBgLight || '#EBF3FF',
                        color: item.flight.airlineColor || 'var(--color-primary)'
                      }}
                    >
                      {item.flight.airlineCode}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy)', margin: '0 0 2px' }}>
                        {item.flight.airline}
                      </h3>
                      <span
                        className={`badge ${isCancelled ? 'badge-orange' : 'badge-success'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Route & Timing & Meta */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
                      <span>{fromAirport.city} ({fromAirport.code})</span>
                      <ArrowRight size={18} color="var(--color-primary)" />
                      <span>{toAirport.city} ({toAirport.code})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="var(--color-primary)" />
                        <span>{depDate}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} color="var(--color-navy)" />
                        <span>{item.passenger?.fullName}</span>
                      </span>
                      <span>
                        Seat(s): <strong style={{ color: 'var(--color-primary)' }}>{seats}</strong>
                      </span>
                      <span style={{ color: 'var(--color-text-light)' }}>
                        PNR: <strong>{item.bookingReference}</strong>
                      </span>
                      {item.fareBreakdown?.appliedCoupon && (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          🏷️ {item.fareBreakdown.appliedCoupon} (-₹{item.fareBreakdown.couponDiscountAmount})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                      ₹{item.fareBreakdown?.totalPrice?.toLocaleString('en-IN') || item.flight.price}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {/* Track Status */}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleTrackStatus(item)}
                        title="Simulated Flight Status"
                      >
                        <Clock size={14} color="var(--color-primary)" />
                        <span>Track</span>
                      </button>

                      {/* View Boarding Pass */}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewConfirmation(item)}
                        title="View Full Boarding Pass"
                      >
                        <Eye size={14} />
                        <span>Boarding Pass</span>
                      </button>

                      {/* Cancel / Delete */}
                      {!isCancelled ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                          onClick={() => setCancelModalBooking(item)}
                          title="Cancel demo reservation"
                        >
                          <XCircle size={14} />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#9CA3AF' }}
                          onClick={() => handlePermanentDelete(item.id)}
                          title="Remove cancelled record"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
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
          <div className="empty-results-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Plane size={40} style={{ transform: 'rotate(-45deg)' }} />
            </div>

            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              No {filterTab !== 'all' ? `${filterTab} ` : ''}Demo Bookings Found
            </h2>

            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
              You don’t have any {filterTab !== 'all' ? filterTab : 'active'} flight reservations in your browser. Choose your preferred destination, complete the quick demo passenger form, and your tickets will appear here!
            </p>

            <Link to="/search" className="btn btn-primary btn-lg">
              <Plane size={18} />
              <span>Search Flights Now</span>
            </Link>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalBooking && (
          <div className="planner-modal-overlay" onClick={() => setCancelModalBooking(null)}>
            <div className="planner-modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--color-orange-light)',
                  color: 'var(--color-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
                  Cancel Demo Reservation?
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> ({cancelModalBooking.flight?.airline} {cancelModalBooking.flight?.fromAirport} → {cancelModalBooking.flight?.toAirport})?
                  <br /><br />
                  This will mark the ticket as <em>CANCELLED (DEMO)</em> and deduct it from your active bookings.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCancelModalBooking(null)}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: '#EF4444', borderColor: '#EF4444' }}
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
