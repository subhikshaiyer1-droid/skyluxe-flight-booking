import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  Home,
  BookmarkCheck,
  Plane,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Download,
  Tag,
  Globe,
  Luggage,
  FileText
} from 'lucide-react';
import { getAirportByCode } from '../data/airports';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback if confetti fails or blocked
    }
  }, []);

  if (!booking) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="empty-results-card">
          <Plane size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h2>No confirmation found</h2>
          <p style={{ margin: '12px 0 24px', color: 'var(--color-text-muted)' }}>
            We could not find an active booking confirmation in this session.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary">Go to Home</Link>
            <Link to="/my-bookings" className="btn btn-primary">Check My Bookings</Link>
          </div>
        </div>
      </div>
    );
  }

  const { flight, passenger, fareBreakdown, bookingReference } = booking;
  const fromAirport = getAirportByCode(flight.fromAirport);
  const toAirport = getAirportByCode(flight.toAirport);
  const isDomestic = flight.isDomestic;

  const handlePrint = () => {
    window.print();
  };

  const seatsDisplay = Array.isArray(passenger.selectedSeats)
    ? passenger.selectedSeats.join(', ')
    : passenger.selectedSeats || '12A (Window)';

  return (
    <div className="confirmation-wrap">
      <div className="container">
        {/* Success Header */}
        <div className="confirmation-header no-print">
          <div className="success-check-circle">
            <CheckCircle2 size={46} strokeWidth={2.5} />
          </div>
          <span className="badge badge-success" style={{ marginBottom: '12px' }}>
            Demo Reservation Confirmed
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
            You're All Set to Fly!
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)' }}>
            Your simulated airline reservation has been successfully booked and saved to your browser.
          </p>
        </div>

        {/* Academic Demonstration Warning Box */}
        <div className="demo-notice-alert" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong>Demonstration Booking Only:</strong> This booking reference <code>{bookingReference}</code> is generated solely for academic demonstration and viva review. No actual ticket is issued.
          </div>
        </div>

        {/* Boarding Pass / Ticket Card (Styled for presentation & print) */}
        <div className="boarding-pass-card" id="printable-boarding-pass">
          {/* Header */}
          <div className="boarding-pass-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: 'white',
                  color: flight.airlineColor || 'var(--color-primary)',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {flight.airlineCode}
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>{flight.airline}</h3>
                <span style={{ fontSize: '0.8rem', color: '#B3C8E4' }}>
                  Flight #{flight.flightNumber} • {flight.cabinClass || 'Economy'} • {isDomestic ? 'Domestic' : 'International'}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B3C8E4' }}>
                Booking Reference (PNR)
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-orange)', letterSpacing: '1px' }}>
                {bookingReference}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="boarding-pass-body">
            {/* Passenger & Flight Meta */}
            <div className="ticket-grid">
              <div className="ticket-item">
                <span className="ticket-label">Lead Passenger</span>
                <span className="ticket-value">{passenger.fullName}</span>
              </div>

              <div className="ticket-item">
                <span className="ticket-label">Travel Date</span>
                <span className="ticket-value">
                  {booking.searchParams?.departureDate || new Date().toISOString().split('T')[0]}
                </span>
              </div>

              <div className="ticket-item">
                <span className="ticket-label">Seat(s) Selected</span>
                <span className="ticket-value" style={{ color: 'var(--color-primary)' }}>
                  {seatsDisplay}
                </span>
              </div>

              <div className="ticket-item">
                <span className="ticket-label">Boarding Gate</span>
                <span className="ticket-value">Gate T2-B14</span>
              </div>

              {/* International Document details */}
              {!isDomestic && passenger.passportNumber && (
                <>
                  <div className="ticket-item">
                    <span className="ticket-label">Passport Number</span>
                    <span className="ticket-value" style={{ letterSpacing: '1px' }}>
                      {passenger.passportNumber}
                    </span>
                  </div>
                  <div className="ticket-item">
                    <span className="ticket-label">Nationality</span>
                    <span className="ticket-value">
                      {passenger.nationality || 'Indian'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Flight Route Visual Timeline */}
            <div style={{
              background: 'var(--color-bg-light)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {flight.departureTime}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {fromAirport?.flag} {fromAirport?.city} ({fromAirport?.code})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '220px' }}>
                  {fromAirport?.name}
                </div>
                {flight.depTz && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{flight.depTz}</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '160px', padding: '0 20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {flight.duration}
                </span>
                <div style={{
                  height: '2px',
                  background: 'var(--color-border)',
                  position: 'relative',
                  margin: '8px 0'
                }}>
                  <Plane
                    size={16}
                    color="var(--color-primary)"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      background: 'var(--color-bg-light)',
                      padding: '0 4px'
                    }}
                  />
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                  {flight.stopDetails}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  {flight.arrivalTime}{' '}
                  {flight.isNextDay && <sup style={{ color: 'var(--color-orange)', fontSize: '0.7rem' }}>+1</sup>}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {toAirport?.flag} {toAirport?.city} ({toAirport?.code})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '220px' }}>
                  {toAirport?.name}
                </div>
                {flight.arrTz && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{flight.arrTz}</div>
                )}
              </div>
            </div>

            {/* Fare Breakdown Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              paddingTop: '20px',
              borderTop: '1px dashed var(--color-border)'
            }}>
              <div>
                <span className="ticket-label">Contact Details</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--color-navy)', marginTop: '4px', lineHeight: '1.5' }}>
                  📧 {passenger.email} <br />
                  📞 {passenger.phone}
                </div>

                <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.75rem' }}>
                    <Luggage size={12} /> {flight.baggage}
                  </span>
                  {fareBreakdown?.appliedCoupon && (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                      <Tag size={12} /> Coupon: {fareBreakdown.appliedCoupon?.code || fareBreakdown.appliedCoupon} (-₹{fareBreakdown.couponDiscountAmount})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="ticket-label">Total Simulated Fare Paid</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                  ₹{fareBreakdown?.totalPrice?.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Demo Transaction Completed
                </div>
              </div>
            </div>
          </div>

          {/* Stub with Barcode simulation */}
          <div className="boarding-pass-stub">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--color-success)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                SkyLuxe Electronic Ticket • Valid for College Presentation
              </span>
            </div>

            {/* Simulated barcode bars */}
            <div className="barcode-sim" title="Simulated e-ticket barcode">
              {[4, 2, 6, 2, 8, 3, 2, 5, 2, 4, 7, 2, 3, 6, 2, 5, 8, 3, 4, 2, 6, 3].map((width, i) => (
                <div
                  key={i}
                  className="barcode-bar"
                  style={{ width: `${width}px`, opacity: i % 2 === 0 ? 0.9 : 0.6 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print" style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '32px'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            id="print-confirmation-btn"
          >
            <Printer size={18} />
            <span>Print Confirmation / Boarding Pass</span>
          </button>

          <Link to="/my-bookings" className="btn btn-primary" id="view-my-bookings-btn">
            <BookmarkCheck size={18} />
            <span>View in My Bookings</span>
          </Link>

          <Link to="/flight-status" className="btn btn-outline">
            <Clock size={18} />
            <span>Track Flight Status</span>
          </Link>

          <Link to="/" className="btn btn-outline">
            <Home size={18} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
