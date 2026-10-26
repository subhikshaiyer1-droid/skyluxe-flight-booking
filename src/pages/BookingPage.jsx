import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAirportByCode } from '../data/airports';
import SeatSelector from '../components/SeatSelector';
import {
  Plane,
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Luggage,
  Sparkles,
  Tag,
  Zap,
  Check,
  X
} from 'lucide-react';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Selected flight passed via state or fallback default
  const { flight, searchParams } = location.state || {};

  // If no flight selected (e.g. direct URL visit), show fallback redirect card
  if (!flight) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="empty-results-card">
          <Plane size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px' }} />
          <h2>No flight selected</h2>
          <p style={{ margin: '12px 0 24px', color: 'var(--color-text-muted)' }}>
            Please search and select a flight before proceeding to the booking form.
          </p>
          <Link to="/search" className="btn btn-primary">
            <span>Search Flights</span>
          </Link>
        </div>
      </div>
    );
  }

  const passengerCount = Number(searchParams?.passengers || 1);
  const travelDate = searchParams?.departureDate || new Date().toISOString().split('T')[0];
  const fromAirport = getAirportByCode(flight.fromAirport);
  const toAirport = getAirportByCode(flight.toAirport);

  // Passenger Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    seatPreference: 'Window'
  });

  const [errors, setErrors] = useState({});

  // Seat Selection State
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Profile prefill availability check
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('skyluxe_traveller_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (parsed.fullName || parsed.email) {
          setHasSavedProfile(true);
        }
      }
    } catch {
      setHasSavedProfile(false);
    }
  }, []);

  const handlePreFillProfile = () => {
    try {
      const storedProfile = localStorage.getItem('skyluxe_traveller_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setFormData({
          fullName: parsed.fullName || formData.fullName,
          email: parsed.email || formData.email,
          phone: parsed.phone || formData.phone,
          seatPreference: parsed.preferredSeat || formData.seatPreference
        });
        setErrors({});
      }
    } catch (err) {
      console.warn('Error prefilling profile:', err);
    }
  };

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code: 'SKY10', discount: 500, label: '10% Off' }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Fare calculations
  const baseFareTotal = flight.price * passengerCount;
  const taxesAndFees = Math.round(baseFareTotal * 0.12); // 12% airport taxes
  const userDevFee = 350 * passengerCount;

  // Compute Seat Upgrade Fees
  const computeSeatFees = () => {
    let fee = 0;
    selectedSeats.forEach((seatId) => {
      const row = parseInt(seatId.slice(0, -1), 10);
      const col = seatId.slice(-1);
      if (row === 1) fee += 350;
      else if (col === 'A' || col === 'F') fee += 150;
      else if (col === 'C' || col === 'D') fee += 120;
    });
    return fee;
  };

  const seatFeeTotal = computeSeatFees();

  // Coupon Discount
  const calculateCouponDiscount = (couponCode) => {
    const code = couponCode.toUpperCase().trim();
    if (code === 'SKY10') {
      return Math.round(baseFareTotal * 0.10);
    } else if (code === 'FIRST500') {
      if (baseFareTotal >= 3000) {
        return 500;
      } else {
        return -1; // Min threshold not met
      }
    } else if (code === 'STUDENT20') {
      return Math.round(baseFareTotal * 0.20);
    }
    return 0;
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponInput.toUpperCase().trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (appliedCoupon && appliedCoupon.code === code) {
      setCouponError('This coupon is already applied.');
      return;
    }

    const discount = calculateCouponDiscount(code);

    if (discount === -1) {
      setCouponError('FIRST500 requires a minimum base fare of ₹3,000.');
    } else if (discount > 0) {
      setAppliedCoupon({
        code,
        discount,
        description: code === 'SKY10' ? '10% Base Fare Discount' : code === 'STUDENT20' ? '20% Student Special' : '₹500 Flat Off'
      });
      setCouponSuccess(`Coupon ${code} applied successfully! You saved ₹${discount.toLocaleString('en-IN')}`);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try SKY10, FIRST500, or STUDENT20.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalPrice = Math.max(0, baseFareTotal + taxesAndFees + userDevFee + seatFeeTotal - couponDiscountAmount);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required as per government ID.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for sending the ticket.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., student@example.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for flight status alerts.';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Generate unique demo booking reference (e.g. SLX-748921)
    const bookingReference = `SLX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = {
      id: bookingReference,
      bookingReference,
      flight,
      searchParams,
      passenger: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        seatPreference: formData.seatPreference,
        passengerCount,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : ['Auto-Assigned 12A']
      },
      fareBreakdown: {
        baseFareTotal,
        taxesAndFees,
        userDevFee,
        seatFeeTotal,
        couponDiscountAmount,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        totalPrice
      },
      bookedAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    // Store in localStorage for persistence
    try {
      const existing = localStorage.getItem('skyluxe_bookings');
      const bookingsList = existing ? JSON.parse(existing) : [];
      bookingsList.unshift(newBooking);
      localStorage.setItem('skyluxe_bookings', JSON.stringify(bookingsList));

      // Trigger custom window event so Navbar badge updates immediately
      window.dispatchEvent(new Event('skyluxe_booking_updated'));
    } catch (err) {
      console.warn('Failed to save booking to localStorage:', err);
    }

    // Navigate to confirmation page
    navigate('/confirmation', {
      state: { booking: newBooking }
    });
  };

  return (
    <div className="booking-page-wrap">
      <div className="container">
        {/* Navigation Breadcrumb & Back */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Flights</span>
          </button>
        </div>

        <div className="booking-grid">
          {/* ------------------------------------------------------------------
              Left Column: Selected Flight Info, Passenger Form & Seat Selector
              ------------------------------------------------------------------ */}
          <div>
            {/* Selected Flight Summary Card */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="badge badge-primary">Selected Flight</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Flight #{flight.flightNumber}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="airline-logo-badge"
                    style={{
                      backgroundColor: flight.airlineBgLight,
                      color: flight.airlineColor
                    }}
                  >
                    {flight.airlineCode}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)' }}>{flight.airline}</h3>
                    <p style={{ fontSize: '0.82rem', margin: 0 }}>{flight.aircraft} • {flight.cabinClass}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy)' }}>
                    {flight.fromAirport} ({flight.departureTime}) → {flight.toAirport} ({flight.arrivalTime})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    {travelDate} • {flight.duration} ({flight.stopDetails})
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details Form */}
            <div className="passenger-form-card" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="form-section-title" style={{ margin: 0 }}>
                  <User size={22} color="var(--color-primary)" />
                  <span>Primary Passenger Details</span>
                </h2>

                {hasSavedProfile && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handlePreFillProfile}
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <Zap size={14} />
                    <span>Auto-fill from Profile</span>
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                Enter the details of the lead traveler. Dummy contact details are fully supported.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="passenger-fields-grid">
                  {/* Full Name */}
                  <div className="search-field" style={{ gridColumn: 'span 2' }}>
                    <label htmlFor="passenger-name" className="field-label">
                      <User size={15} className="field-icon" />
                      <span>Full Name (as per government ID) *</span>
                    </label>
                    <div className={`field-input-box ${errors.fullName ? 'has-error' : ''}`}>
                      <input
                        id="passenger-name"
                        type="text"
                        className="field-input"
                        placeholder="e.g. Subhiksha Sharma"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: null });
                        }}
                      />
                    </div>
                    {errors.fullName && (
                      <span className="field-error-msg">
                        <AlertCircle size={13} /> {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="search-field">
                    <label htmlFor="passenger-email" className="field-label">
                      <Mail size={15} className="field-icon" />
                      <span>Email Address *</span>
                    </label>
                    <div className={`field-input-box ${errors.email ? 'has-error' : ''}`}>
                      <input
                        id="passenger-email"
                        type="email"
                        className="field-input"
                        placeholder="e.g. subhiksha@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                      />
                    </div>
                    {errors.email && (
                      <span className="field-error-msg">
                        <AlertCircle size={13} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="search-field">
                    <label htmlFor="passenger-phone" className="field-label">
                      <Phone size={15} className="field-icon" />
                      <span>Phone Number *</span>
                    </label>
                    <div className={`field-input-box ${errors.phone ? 'has-error' : ''}`}>
                      <input
                        id="passenger-phone"
                        type="tel"
                        className="field-input"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                      />
                    </div>
                    {errors.phone && (
                      <span className="field-error-msg">
                        <AlertCircle size={13} /> {errors.phone}
                      </span>
                    )}
                  </div>

                  {/* Seat Preference */}
                  <div className="search-field">
                    <label htmlFor="seat-pref" className="field-label">
                      <Plane size={15} className="field-icon" />
                      <span>General Preference</span>
                    </label>
                    <div className="field-input-box">
                      <select
                        id="seat-pref"
                        className="field-select"
                        value={formData.seatPreference}
                        onChange={(e) => setFormData({ ...formData, seatPreference: e.target.value })}
                      >
                        <option value="Window">Window Preference</option>
                        <option value="Aisle">Aisle Preference</option>
                        <option value="Middle">Middle Preference</option>
                      </select>
                    </div>
                  </div>

                  {/* Passenger Count info */}
                  <div className="search-field">
                    <label className="field-label">
                      <Briefcase size={15} className="field-icon" />
                      <span>Passengers Travelling</span>
                    </label>
                    <div className="field-input-box" style={{ background: '#F8FAFC' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>
                        {passengerCount} {passengerCount > 1 ? 'Adults' : 'Adult'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seat Selector Component Step */}
                <div style={{ marginTop: '24px' }}>
                  <SeatSelector
                    passengerCount={passengerCount}
                    selectedSeats={selectedSeats}
                    onSeatChange={setSelectedSeats}
                    airline={flight.airline}
                  />
                </div>

                {/* College Simulation Safe Notice */}
                <div className="demo-notice-alert" style={{ marginTop: '24px' }}>
                  <ShieldCheck size={20} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Academic Project Simulation:</strong> No actual credit card, payment gateway, or sensitive details are requested. Submitting this form safely generates a demo boarding pass stored in your browser.
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                  >
                    <span>Back to Flight Results</span>
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    id="confirm-booking-btn"
                    style={{ flex: 1 }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Confirm Demo Booking (₹{totalPrice.toLocaleString('en-IN')})</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ------------------------------------------------------------------
              Right Column: Coupon Field & Detailed Fare Summary Card
              ------------------------------------------------------------------ */}
          <aside>
            <div className="fare-summary-card">
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '16px' }}>
                Fare Breakdown
              </h3>

              {/* Coupon Application Box */}
              <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={14} color="var(--color-primary)" />
                  <span>Promo / Coupon Code</span>
                </label>

                {!appliedCoupon ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="field-input"
                      placeholder="e.g. SKY10, FIRST500"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        background: 'var(--color-bg-light)',
                        border: '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        fontSize: '0.88rem'
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--color-success-bg)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #A7F3D0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={16} color="#059669" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>
                        {appliedCoupon.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '4px' }}>
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '4px', fontWeight: 500 }}>
                    {couponSuccess}
                  </div>
                )}

                {/* Available coupons hint */}
                <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
                  Active codes: <strong>SKY10</strong> (10% off) | <strong>FIRST500</strong> (₹500 off) | <strong>STUDENT20</strong> (20% off)
                </div>
              </div>

              {/* Fare Line Items */}
              <div className="fare-row">
                <span>Base Fare ({passengerCount} × ₹{flight.price.toLocaleString('en-IN')})</span>
                <span>₹{baseFareTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="fare-row">
                <span>Airport Taxes & GST (12%)</span>
                <span>₹{taxesAndFees.toLocaleString('en-IN')}</span>
              </div>

              <div className="fare-row">
                <span>User Development Fee (UDF)</span>
                <span>₹{userDevFee.toLocaleString('en-IN')}</span>
              </div>

              {seatFeeTotal > 0 && (
                <div className="fare-row" style={{ color: 'var(--color-primary)' }}>
                  <span>Seat Upgrade Fee</span>
                  <span>+ ₹{seatFeeTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="fare-row" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>- ₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="fare-row total-row">
                <span>Total Amount</span>
                <span style={{ color: 'var(--color-primary)' }}>
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Inclusions list */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)', fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Luggage size={14} color="var(--color-primary)" />
                  <span>{flight.baggage} included</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plane size={14} color="var(--color-orange)" />
                  <span>
                    Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Standard free seats'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--color-success)" />
                  <span>Saved locally in your browser</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
