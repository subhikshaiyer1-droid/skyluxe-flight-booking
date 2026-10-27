import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAirportByCode, isDomesticRoute } from '../data/airports';
import SeatSelector from '../components/SeatSelector';
import { calculateFlightFare, AVAILABLE_COUPONS } from '../utils/fareCalculator';
import { convertCurrency, formatCurrency } from '../utils/currency';
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
  X,
  Globe,
  FileText,
  Clock,
  Compass,
  DollarSign
} from 'lucide-react';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Selected flight passed via state
  const { flight, searchParams = {} } = location.state || {};

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
  const returnDate = searchParams?.returnDate || '';
  const tripType = searchParams?.tripType || 'oneWay';
  const isRoundTrip = tripType === 'roundTrip';

  const fromAirport = getAirportByCode(flight.fromAirport);
  const toAirport = getAirportByCode(flight.toAirport);
  const isDomestic = flight.isDomestic ?? isDomesticRoute(flight.fromAirport, flight.toAirport);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCountryCode: '+91',
    phone: '',
    seatPreference: 'Window',
    // International Passport Details (Only required for International)
    passportNumber: '',
    passportExpiry: '',
    nationality: 'Indian',
    passportCountry: 'India'
  });

  const [errors, setErrors] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Currency Display selection
  const [displayCurrency, setDisplayCurrency] = useState('INR');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Prefill from traveller profile if available in localStorage
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
        setFormData((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          seatPreference: parsed.preferredSeat || prev.seatPreference,
          passportNumber: parsed.passportNumber || prev.passportNumber,
          passportExpiry: parsed.passportExpiry || prev.passportExpiry,
          nationality: parsed.nationality || prev.nationality
        }));
        setErrors({});
      }
    } catch (err) {
      console.warn('Error prefilling profile:', err);
    }
  };

  // Shared fare calculation
  const fareBreakdown = calculateFlightFare({
    flight,
    passengerCount,
    selectedSeats,
    couponCode: appliedCouponCode,
    tripType
  });

  // Handle Coupon Apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const code = couponInput.toUpperCase().trim();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    if (appliedCouponCode === code) {
      setCouponError('This coupon is already applied.');
      return;
    }

    // Test with fare calculator
    const testCalc = calculateFlightFare({
      flight,
      passengerCount,
      selectedSeats,
      couponCode: code,
      tripType
    });

    if (testCalc.appliedCoupon) {
      setAppliedCouponCode(code);
      setCouponSuccess(`Coupon ${code} applied! Saved ₹${testCalc.couponDiscountAmount.toLocaleString('en-IN')}`);
      setCouponInput('');
    } else {
      setCouponError(
        isDomestic && code === 'GLOBAL15'
          ? 'GLOBAL15 is only valid for international flights.'
          : 'Invalid or ineligible coupon code. Try SKY10, FIRST500, or STUDENT20.'
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name as per government ID / passport is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    // 2. Email Address
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for demo ticket delivery.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Phone Number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for SMS boarding alerts.';
    } else if (!/^[0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    // 4. International Passport Validations (ONLY if international)
    if (!isDomestic) {
      if (!formData.passportNumber.trim()) {
        newErrors.passportNumber = 'Passport number is required for international demo booking.';
      } else if (formData.passportNumber.trim().length < 6) {
        newErrors.passportNumber = 'Please enter a valid passport number (at least 6 characters).';
      }

      if (!formData.passportExpiry) {
        newErrors.passportExpiry = 'Passport expiry date is required.';
      } else {
        // Must be valid at least 6 months after travel date
        const expDate = new Date(formData.passportExpiry);
        const flightDepDate = new Date(travelDate);
        const sixMonthsAfter = new Date(flightDepDate);
        sixMonthsAfter.setMonth(sixMonthsAfter.getMonth() + 6);

        if (expDate <= sixMonthsAfter) {
          newErrors.passportExpiry = 'Passport must be valid for at least 6 months from travel date.';
        }
      }

      if (!formData.nationality.trim()) {
        newErrors.nationality = 'Nationality is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Generate unique demo booking reference (e.g. SLX-849201)
    const bookingReference = `SLX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking = {
      id: bookingReference,
      bookingReference,
      flight,
      searchParams: {
        ...searchParams,
        from: flight.fromAirport,
        to: flight.toAirport,
        departureDate: travelDate,
        returnDate,
        tripType,
        passengers: passengerCount,
        cabinClass: flight.cabinClass
      },
      passenger: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: `${formData.phoneCountryCode} ${formData.phone.trim()}`,
        seatPreference: formData.seatPreference,
        passengerCount,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : ['Auto-Assigned 12A'],
        // International details
        isInternational: !isDomestic,
        passportNumber: !isDomestic ? formData.passportNumber.trim() : null,
        passportExpiry: !isDomestic ? formData.passportExpiry : null,
        nationality: !isDomestic ? formData.nationality : 'Indian',
        passportCountry: !isDomestic ? formData.passportCountry : 'India'
      },
      fareBreakdown,
      bookedAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    // Store in LocalStorage
    try {
      const existing = localStorage.getItem('skyluxe_bookings');
      const bookingsList = existing ? JSON.parse(existing) : [];
      bookingsList.unshift(newBooking);
      localStorage.setItem('skyluxe_bookings', JSON.stringify(bookingsList));
      window.dispatchEvent(new Event('skyluxe_booking_updated'));
    } catch (err) {
      console.warn('Failed to save booking to localStorage:', err);
    }

    // Short simulated network delay for realism & prevent double submit
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/confirmation', { state: { booking: newBooking } });
    }, 600);
  };

  // Converted total price if foreign currency selected
  const convertedTotal =
    displayCurrency === 'INR'
      ? fareBreakdown.totalPrice
      : convertCurrency(fareBreakdown.totalPrice, 'INR', displayCurrency);

  return (
    <div className="booking-page section-pad" style={{ paddingTop: '32px' }}>
      <div className="container">
        {/* Back navigation */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Flight Results</span>
          </button>
        </div>

        {/* Demo Disclaimer Top Alert */}
        <div className="demo-notice-alert" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <strong>Demonstration Booking Application:</strong> This is an educational project reservation portal. No live ticket is issued and no actual payment is charged. Test data and fictitious passenger details are encouraged.
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              className="badge"
              style={{
                background: isDomestic ? 'rgba(38, 132, 255, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                color: isDomestic ? 'var(--color-primary)' : '#7E22CE',
                fontWeight: 700
              }}
            >
              {isDomestic ? '🇮🇳 Domestic Flight Booking' : '🌐 International Flight Booking'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--color-navy)', margin: 0 }}>
            Passenger & Travel Details
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)' }}>
            Complete traveller information and seat preferences to confirm your demo e-ticket.
          </p>
        </div>

        {/* Main 2-Column Grid: Form Left, Flight Summary Right */}
        <div className="booking-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '32px', alignItems: 'start' }}>
          {/* LEFT: Passenger Form */}
          <div className="booking-form-col">
            <form onSubmit={handleSubmit} noValidate>
              {/* Profile Prefill Callout */}
              {hasSavedProfile && (
                <div style={{
                  padding: '14px 18px',
                  background: 'var(--color-primary-light)',
                  border: '1px solid #BFDBFE',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                    <Sparkles size={16} color="var(--color-primary)" />
                    <span>Saved Traveller Profile Available</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handlePreFillProfile}
                  >
                    Auto-Fill My Details
                  </button>
                </div>
              )}

              {/* 1. Primary Traveller Information */}
              <div className="booking-section-card" style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--color-primary)" />
                  <span>Lead Traveller Details ({passengerCount} {passengerCount > 1 ? 'Passengers' : 'Passenger'})</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {/* Full Name */}
                  <div className="search-field">
                    <label htmlFor="p-name" className="field-label">
                      <span>Full Name (as on Government ID {isDomestic ? '' : '/ Passport'}) *</span>
                    </label>
                    <div className={`field-input-box ${errors.fullName ? 'has-error' : ''}`}>
                      <input
                        id="p-name"
                        type="text"
                        className="field-input"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
                        }}
                      />
                    </div>
                    {errors.fullName && (
                      <span className="field-error-msg"><AlertCircle size={13} /> {errors.fullName}</span>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="search-field">
                      <label htmlFor="p-email" className="field-label">
                        <Mail size={14} className="field-icon" />
                        <span>Email Address *</span>
                      </label>
                      <div className={`field-input-box ${errors.email ? 'has-error' : ''}`}>
                        <input
                          id="p-email"
                          type="email"
                          className="field-input"
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                          }}
                        />
                      </div>
                      {errors.email && (
                        <span className="field-error-msg"><AlertCircle size={13} /> {errors.email}</span>
                      )}
                    </div>

                    {/* Phone with Country Code Selector */}
                    <div className="search-field">
                      <label htmlFor="p-phone" className="field-label">
                        <Phone size={14} className="field-icon" />
                        <span>Phone Number *</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="field-select"
                          style={{ width: '100px', flexShrink: 0 }}
                          value={formData.phoneCountryCode}
                          onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+81">🇯🇵 +81</option>
                        </select>
                        <div className={`field-input-box ${errors.phone ? 'has-error' : ''}`} style={{ flex: 1 }}>
                          <input
                            id="p-phone"
                            type="tel"
                            className="field-input"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                            }}
                          />
                        </div>
                      </div>
                      {errors.phone && (
                        <span className="field-error-msg"><AlertCircle size={13} /> {errors.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. International Passport Details Section (Section 5 Requirement) */}
              {!isDomestic && (
                <div className="booking-section-card" style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #D8B4FE', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#6B21A8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={18} color="#7E22CE" />
                      <span>International Travel Documents (Passport)</span>
                    </h3>
                    <span className="badge" style={{ background: '#F3E8FF', color: '#7E22CE', fontSize: '0.75rem' }}>
                      Required for International
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
                    *Demo Simulation: Enter sample passport numbers (e.g. M1234567). Never share sensitive real document data on demo applications.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Passport Number */}
                    <div className="search-field">
                      <label htmlFor="passport-num" className="field-label">
                        <span>Passport Number *</span>
                      </label>
                      <div className={`field-input-box ${errors.passportNumber ? 'has-error' : ''}`}>
                        <input
                          id="passport-num"
                          type="text"
                          className="field-input"
                          placeholder="e.g. Z9876543"
                          value={formData.passportNumber}
                          onChange={(e) => {
                            setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() });
                            if (errors.passportNumber) setErrors((prev) => ({ ...prev, passportNumber: null }));
                          }}
                        />
                      </div>
                      {errors.passportNumber && (
                        <span className="field-error-msg"><AlertCircle size={13} /> {errors.passportNumber}</span>
                      )}
                    </div>

                    {/* Passport Expiry Date */}
                    <div className="search-field">
                      <label htmlFor="passport-exp" className="field-label">
                        <span>Passport Expiry Date * (6+ months validity)</span>
                      </label>
                      <div className={`field-input-box ${errors.passportExpiry ? 'has-error' : ''}`}>
                        <input
                          id="passport-exp"
                          type="date"
                          className="field-input"
                          value={formData.passportExpiry}
                          onChange={(e) => {
                            setFormData({ ...formData, passportExpiry: e.target.value });
                            if (errors.passportExpiry) setErrors((prev) => ({ ...prev, passportExpiry: null }));
                          }}
                        />
                      </div>
                      {errors.passportExpiry && (
                        <span className="field-error-msg"><AlertCircle size={13} /> {errors.passportExpiry}</span>
                      )}
                    </div>

                    {/* Nationality */}
                    <div className="search-field">
                      <label htmlFor="nationality" className="field-label">
                        <span>Nationality *</span>
                      </label>
                      <div className="field-input-box">
                        <select
                          id="nationality"
                          className="field-select"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        >
                          <option value="Indian">Indian (🇮🇳)</option>
                          <option value="United States">American (🇺🇸)</option>
                          <option value="British">British (🇬🇧)</option>
                          <option value="Emirati">Emirati (🇦🇪)</option>
                          <option value="Singaporean">Singaporean (🇸🇬)</option>
                          <option value="Australian">Australian (🇦🇺)</option>
                          <option value="Canadian">Canadian (🇨🇦)</option>
                          <option value="Other">Other Nationality</option>
                        </select>
                      </div>
                    </div>

                    {/* Issuing Country */}
                    <div className="search-field">
                      <label htmlFor="issue-country" className="field-label">
                        <span>Passport Issuing Country *</span>
                      </label>
                      <div className="field-input-box">
                        <select
                          id="issue-country"
                          className="field-select"
                          value={formData.passportCountry}
                          onChange={(e) => setFormData({ ...formData, passportCountry: e.target.value })}
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Australia">Australia</option>
                          <option value="Canada">Canada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Visa & Entry Advisory Disclaimer */}
                  <div style={{
                    marginTop: '18px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    fontSize: '0.8rem',
                    color: '#581C87',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <FileText size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>Visa & Entry Requirements Notice:</strong> International flights require valid entry visas, eVisa, or Visa-on-Arrival approval depending on destination country ({toAirport?.country}) and passenger passport. Please verify all official immigration protocols with relevant consulates before actual travel.
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Seat Selection */}
              <div className="booking-section-card" style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} color="var(--color-primary)" />
                  <span>Interactive Seat Selection</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  Select seats for {passengerCount} traveller{passengerCount > 1 ? 's' : ''}. Front row seats offer extra legroom.
                </p>

                <SeatSelector
                  passengerCount={passengerCount}
                  selectedSeats={selectedSeats}
                  onChange={setSelectedSeats}
                />
              </div>

              {/* 4. Coupon Code System */}
              <div className="booking-section-card" style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={18} color="var(--color-orange)" />
                  <span>Promo & Coupon Code</span>
                </h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Enter Coupon (e.g. SKY10, STUDENT20)"
                    style={{ textTransform: 'uppercase' }}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleApplyCoupon}
                  >
                    Apply Code
                  </button>
                </div>

                {couponError && (
                  <div style={{ fontSize: '0.82rem', color: '#DC2626', marginTop: '6px' }}>
                    {couponError}
                  </div>
                )}
                {couponSuccess && (
                  <div style={{ fontSize: '0.82rem', color: '#059669', marginTop: '6px', fontWeight: 600 }}>
                    {couponSuccess}
                  </div>
                )}

                {/* Applied coupon badge */}
                {fareBreakdown.appliedCoupon && (
                  <div style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ECFDF5',
                    color: '#047857',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    <Check size={14} />
                    <span>{fareBreakdown.appliedCoupon.code}: -₹{fareBreakdown.couponDiscountAmount.toLocaleString('en-IN')}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', color: '#047857', cursor: 'pointer', padding: 0 }}
                      title="Remove coupon"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Available Promo Chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {AVAILABLE_COUPONS.map((cpn) => {
                    if (cpn.internationalOnly && isDomestic) return null;
                    return (
                      <button
                        key={cpn.code}
                        type="button"
                        onClick={() => {
                          setCouponInput(cpn.code);
                          setAppliedCouponCode(cpn.code);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px dashed var(--color-primary)',
                          background: '#F0F7FF',
                          color: 'var(--color-primary)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {cpn.code}: {cpn.description}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA Button */}
              <div style={{ marginTop: '24px' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                  disabled={isSubmitting}
                  id="confirm-demo-booking-btn"
                >
                  {isSubmitting ? (
                    <span>Confirming Demo Reservation...</span>
                  ) : (
                    <span>Confirm Demo Booking ({formatCurrency(convertedTotal, displayCurrency)})</span>
                  )}
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  ✓ Instant simulated confirmation • Saved to browser LocalStorage • Printable digital boarding pass
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: Flight Itinerary Summary & Price Breakdown */}
          <aside className="booking-summary-col">
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', padding: '24px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '96px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy)', margin: 0 }}>
                  Flight Summary
                </h3>
                <span
                  className="badge"
                  style={{
                    background: isDomestic ? 'rgba(38, 132, 255, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                    color: isDomestic ? 'var(--color-primary)' : '#7E22CE',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {isDomestic ? 'Domestic' : 'International'}
                </span>
              </div>

              {/* Airline header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  className="airline-logo-badge"
                  style={{
                    backgroundColor: flight.airlineBgLight || '#EBF3FF',
                    color: flight.airlineColor || 'var(--color-primary)',
                    width: '38px',
                    height: '38px',
                    fontSize: '0.85rem'
                  }}
                >
                  {flight.airlineCode}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-navy)' }}>{flight.airline}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Flight {flight.flightNumber} • {flight.aircraft}
                  </div>
                </div>
              </div>

              {/* Outbound Journey Itinerary */}
              <div style={{ background: 'var(--color-bg-light)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    OUTBOUND: {travelDate}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {flight.duration}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-navy)' }}>
                      {flight.departureTime}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{flight.fromAirport}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>{flight.fromCity}</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0 8px' }}>
                    <Plane size={16} color="var(--color-primary)" style={{ transform: 'rotate(90deg)' }} />
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      {flight.stopDetails}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-navy)' }}>
                      {flight.arrivalTime}
                      {flight.isNextDay && <sup style={{ color: 'var(--color-orange)', fontSize: '0.7rem' }}>+1</sup>}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{flight.toAirport}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>{flight.toCity}</div>
                  </div>
                </div>

                {/* Layover detail if connecting */}
                {flight.layoverCity && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1', fontSize: '0.74rem', color: '#D97706' }}>
                    ⏱ Connection: {flight.layoverDuration || '2h 15m'} layover at {flight.layoverCity}
                  </div>
                )}
              </div>

              {/* Round Trip Return Summary if roundTrip */}
              {isRoundTrip && returnDate && (
                <div style={{ background: '#FFFBEB', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B45309' }}>
                      RETURN JOURNEY: {returnDate}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {flight.duration}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-navy)' }}>
                        14:30
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{flight.toAirport}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <Plane size={16} color="#B45309" style={{ transform: 'rotate(270deg)' }} />
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Return Leg</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-navy)' }}>
                        17:45
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{flight.fromAirport}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Baggage info */}
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Luggage size={14} color="var(--color-primary)" />
                <span>Baggage: {flight.baggage}</span>
              </div>

              {/* Currency Selector for Estimated Fares */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-navy)' }}>
                  View Currency:
                </span>
                <select
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>

              {/* Fare Breakdown Table */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                  <span>Base Fare ({passengerCount} {passengerCount > 1 ? 'Adults' : 'Adult'})</span>
                  <span>₹{fareBreakdown.baseFareTotal.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                  <span>Aviation Taxes & Fees (12%)</span>
                  <span>₹{fareBreakdown.taxesAndFees.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                  <span>User Development Fee (UDF)</span>
                  <span>₹{fareBreakdown.userDevFee.toLocaleString('en-IN')}</span>
                </div>

                {fareBreakdown.seatFeeTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
                    <span>Seat Selection Upgrades</span>
                    <span>₹{fareBreakdown.seatFeeTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {fareBreakdown.couponDiscountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#059669', fontWeight: 600 }}>
                    <span>Coupon Discount ({fareBreakdown.appliedCoupon?.code})</span>
                    <span>-₹{fareBreakdown.couponDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ borderTop: '2px solid var(--color-navy)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-navy)' }}>Total Payable</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--color-primary)' }}>
                      {formatCurrency(convertedTotal, displayCurrency)}
                    </div>
                    {displayCurrency !== 'INR' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Approx. ₹{fareBreakdown.totalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
