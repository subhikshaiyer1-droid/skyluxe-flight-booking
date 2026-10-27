import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AIRPORTS, DOMESTIC_AIRPORTS, INTERNATIONAL_AIRPORTS, isDomesticRoute, getAirportByCode } from '../data/airports';
import { saveRecentSearch } from '../utils/plannerStorage';
import {
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  PlaneTakeoff,
  PlaneLanding,
  Briefcase,
  AlertCircle,
  Globe,
  MapPin,
  Sparkles,
  Compass
} from 'lucide-react';

export default function FlightSearchForm({ initialValues = {}, onSearch = null, compact = false }) {
  const navigate = useNavigate();

  // Helper to format Date to YYYY-MM-DD
  const formatDateString = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDateString(new Date());

  // Determine initial flight type: domestic vs international based on initial airport codes
  const initialFlightType = () => {
    if (initialValues.flightCategory) return initialValues.flightCategory;
    const fromCode = initialValues.from || 'BOM';
    const toCode = initialValues.to || 'DEL';
    return isDomesticRoute(fromCode, toCode) ? 'domestic' : 'international';
  };

  // Form State
  const [flightCategory, setFlightCategory] = useState(initialFlightType()); // 'domestic' | 'international'
  const [tripType, setTripType] = useState(initialValues.tripType || 'oneWay'); // 'oneWay' | 'roundTrip'
  const [origin, setOrigin] = useState(initialValues.from || (initialFlightType() === 'domestic' ? 'BOM' : 'BOM'));
  const [destination, setDestination] = useState(initialValues.to || (initialFlightType() === 'domestic' ? 'DEL' : 'DXB'));
  const [departureDate, setDepartureDate] = useState(initialValues.departureDate || todayStr);
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || '');
  const [passengers, setPassengers] = useState(initialValues.passengers ? Number(initialValues.passengers) : 1);
  const [cabinClass, setCabinClass] = useState(initialValues.cabinClass || 'Economy');

  // Error State for friendly validation
  const [errors, setErrors] = useState({});

  // When switching between Domestic and International, adjust destination gracefully if needed
  const handleCategorySwitch = (category) => {
    setFlightCategory(category);
    setErrors({});

    if (category === 'domestic') {
      // Ensure origin and destination are domestic
      const isFromDom = getAirportByCode(origin)?.isDomestic;
      const isToDom = getAirportByCode(destination)?.isDomestic;

      const newFrom = isFromDom ? origin : 'BOM';
      let newTo = isToDom ? destination : 'DEL';
      if (newFrom === newTo) {
        newTo = newFrom === 'BOM' ? 'DEL' : 'BOM';
      }
      setOrigin(newFrom);
      setDestination(newTo);
    } else {
      // International: default destination to DXB if currently domestic
      const isToDom = getAirportByCode(destination)?.isDomestic;
      if (isToDom) {
        setDestination('DXB');
      }
    }
  };

  // Quick route presets
  const handleQuickRoute = (from, to, cat = 'domestic') => {
    setFlightCategory(cat);
    setOrigin(from);
    setDestination(to);
    setErrors({});
  };

  // Swap airports handler
  const handleSwapAirports = () => {
    // Check if swap would violate domestic constraint
    if (flightCategory === 'domestic') {
      const isFromDom = getAirportByCode(destination)?.isDomestic;
      const isToDom = getAirportByCode(origin)?.isDomestic;
      if (!isFromDom || !isToDom) {
        setFlightCategory('international');
      }
    }
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    if (errors.destination || errors.origin) {
      setErrors((prev) => ({ ...prev, destination: null, origin: null }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Origin and destination required
    if (!origin) {
      newErrors.origin = 'Please select a departure city.';
    }
    if (!destination) {
      newErrors.destination = 'Please select an arrival city.';
    }

    // 2. Origin and destination cannot be identical
    if (origin && destination && origin.toUpperCase() === destination.toUpperCase()) {
      newErrors.destination = 'Departure and arrival airports cannot be identical.';
    }

    // 3. Category constraint check
    if (flightCategory === 'domestic') {
      const fromAir = getAirportByCode(origin);
      const toAir = getAirportByCode(destination);
      if (!fromAir?.isDomestic || !toAir?.isDomestic) {
        newErrors.destination = 'Domestic flights must be between airports within India.';
      }
    }

    // 4. Departure date cannot be in the past
    if (!departureDate) {
      newErrors.departureDate = 'Departure date is required.';
    } else if (departureDate < todayStr) {
      newErrors.departureDate = 'Departure date cannot be in the past.';
    }

    // 5. Return date validation for round-trip
    if (tripType === 'roundTrip') {
      if (!returnDate) {
        newErrors.returnDate = 'Return date is required for round-trip journeys.';
      } else if (returnDate < departureDate) {
        newErrors.returnDate = 'Return date cannot be earlier than departure date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Save search to LocalStorage for Recent Searches
    saveRecentSearch({
      from: origin,
      to: destination,
      departureDate,
      returnDate: tripType === 'roundTrip' ? returnDate : null,
      tripType,
      passengers,
      cabinClass,
      category: flightCategory
    });

    const queryParams = new URLSearchParams({
      from: origin,
      to: destination,
      departureDate,
      tripType,
      passengers: String(passengers),
      cabinClass,
      category: flightCategory
    });

    if (tripType === 'roundTrip' && returnDate) {
      queryParams.set('returnDate', returnDate);
    }

    if (onSearch) {
      onSearch({
        from: origin,
        to: destination,
        departureDate,
        returnDate,
        tripType,
        passengers,
        cabinClass,
        category: flightCategory
      });
    } else {
      navigate(`/search?${queryParams.toString()}`);
    }
  };

  // Airport dropdown lists based on category
  const originAirportList = flightCategory === 'domestic' ? DOMESTIC_AIRPORTS : AIRPORTS;
  const destinationAirportList = flightCategory === 'domestic' ? DOMESTIC_AIRPORTS : AIRPORTS;

  return (
    <div className={`search-card ${compact ? 'search-card-compact' : ''}`}>
      {/* Flight Category Tabs: Domestic Flights vs International Flights */}
      <div className="flight-category-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          className={`category-tab-btn ${flightCategory === 'domestic' ? 'active' : ''}`}
          onClick={() => handleCategorySwitch('domestic')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-pill)',
            border: flightCategory === 'domestic' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: flightCategory === 'domestic' ? 'var(--color-primary-light)' : 'var(--color-white)',
            color: flightCategory === 'domestic' ? 'var(--color-primary)' : 'var(--color-navy)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🇮🇳</span>
          <span>Domestic Flights (India)</span>
        </button>

        <button
          type="button"
          className={`category-tab-btn ${flightCategory === 'international' ? 'active' : ''}`}
          onClick={() => handleCategorySwitch('international')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: 'var(--radius-pill)',
            border: flightCategory === 'international' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
            background: flightCategory === 'international' ? 'var(--color-primary-light)' : 'var(--color-white)',
            color: flightCategory === 'international' ? 'var(--color-primary)' : 'var(--color-navy)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Globe size={16} />
          <span>International Flights</span>
        </button>

        <Link
          to="/multi-city"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.86rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            background: '#F0F7FF'
          }}
        >
          <Compass size={14} />
          <span>Multi-City Planner</span>
        </Link>
      </div>

      {/* Trip Type Selector & Quick Suggestions */}
      <div className="trip-type-selector" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`trip-pill ${tripType === 'oneWay' ? 'active' : ''}`}
            onClick={() => {
              setTripType('oneWay');
              setErrors((prev) => ({ ...prev, returnDate: null }));
            }}
          >
            <span>One-way</span>
          </button>

          <button
            type="button"
            className={`trip-pill ${tripType === 'roundTrip' ? 'active' : ''}`}
            onClick={() => {
              setTripType('roundTrip');
              if (!returnDate) {
                const nextDate = new Date(departureDate || todayStr);
                nextDate.setDate(nextDate.getDate() + 4);
                setReturnDate(formatDateString(nextDate));
              }
            }}
          >
            <span>Round-trip</span>
          </button>
        </div>

        {/* Quick Route Suggestion Pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Popular:
          </span>
          {flightCategory === 'domestic' ? (
            <>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('BOM', 'GOI', 'domestic')}
                title="Mumbai to Goa"
              >
                BOM → GOI
              </button>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('DEL', 'BOM', 'domestic')}
                title="Delhi to Mumbai"
              >
                DEL → BOM
              </button>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('BLR', 'DEL', 'domestic')}
                title="Bengaluru to Delhi"
              >
                BLR → DEL
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('BOM', 'DXB', 'international')}
                title="Mumbai to Dubai"
              >
                BOM → DXB
              </button>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('DEL', 'LHR', 'international')}
                title="Delhi to London"
              >
                DEL → LHR
              </button>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('BOM', 'SIN', 'international')}
                title="Mumbai to Singapore"
              >
                BOM → SIN
              </button>
              <button
                type="button"
                className="quick-route-chip"
                onClick={() => handleQuickRoute('BLR', 'BKK', 'international')}
                title="Bengaluru to Bangkok"
              >
                BLR → BKK
              </button>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: '16px' }}>
        {/* Main Fields Grid: Origin - Swap - Destination - Departure Date - Return Date */}
        <div className="search-fields-grid">
          {/* Origin Airport */}
          <div className="search-field">
            <label htmlFor="origin-airport" className="field-label">
              <PlaneTakeoff size={15} className="field-icon" />
              <span>From ({flightCategory === 'domestic' ? 'India' : 'Origin'})</span>
            </label>
            <div className={`field-input-box ${errors.origin ? 'has-error' : ''}`}>
              <select
                id="origin-airport"
                className="field-select"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  if (errors.origin || errors.destination) {
                    setErrors((prev) => ({ ...prev, origin: null, destination: null }));
                  }
                }}
              >
                {flightCategory === 'domestic' ? (
                  originAirportList.map((airport) => (
                    <option key={`from-${airport.code}`} value={airport.code}>
                      {airport.flag} {airport.city} ({airport.code})
                    </option>
                  ))
                ) : (
                  <>
                    <optgroup label="── Indian Hubs (Departures) ──">
                      {DOMESTIC_AIRPORTS.map((airport) => (
                        <option key={`from-in-${airport.code}`} value={airport.code}>
                          {airport.flag} {airport.city} ({airport.code})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── International Hubs ──">
                      {INTERNATIONAL_AIRPORTS.map((airport) => (
                        <option key={`from-int-${airport.code}`} value={airport.code}>
                          {airport.flag} {airport.city} ({airport.code}) - {airport.country}
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
            {errors.origin && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.origin}
              </span>
            )}
          </div>

          {/* Swap Button */}
          <div className="swap-btn-container">
            <button
              type="button"
              className="swap-airports-btn"
              onClick={handleSwapAirports}
              title="Swap From and To airports"
              aria-label="Swap departure and arrival airports"
            >
              <ArrowLeftRight size={18} />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="search-field">
            <label htmlFor="dest-airport" className="field-label">
              <PlaneLanding size={15} className="field-icon" />
              <span>To ({flightCategory === 'domestic' ? 'India' : 'Destination'})</span>
            </label>
            <div className={`field-input-box ${errors.destination ? 'has-error' : ''}`}>
              <select
                id="dest-airport"
                className="field-select"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (errors.destination) {
                    setErrors((prev) => ({ ...prev, destination: null }));
                  }
                }}
              >
                {flightCategory === 'domestic' ? (
                  destinationAirportList.map((airport) => (
                    <option key={`to-${airport.code}`} value={airport.code}>
                      {airport.flag} {airport.city} ({airport.code})
                    </option>
                  ))
                ) : (
                  <>
                    <optgroup label="── International Destinations ──">
                      {INTERNATIONAL_AIRPORTS.map((airport) => (
                        <option key={`to-int-${airport.code}`} value={airport.code}>
                          {airport.flag} {airport.city} ({airport.code}) - {airport.country}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── Indian Hubs (Inbound) ──">
                      {DOMESTIC_AIRPORTS.map((airport) => (
                        <option key={`to-in-${airport.code}`} value={airport.code}>
                          {airport.flag} {airport.city} ({airport.code})
                        </option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
            </div>
            {errors.destination && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.destination}
              </span>
            )}
          </div>

          {/* Departure Date */}
          <div className="search-field">
            <label htmlFor="dep-date" className="field-label">
              <Calendar size={15} className="field-icon" />
              <span>Departure Date</span>
            </label>
            <div className={`field-input-box ${errors.departureDate ? 'has-error' : ''}`}>
              <input
                id="dep-date"
                type="date"
                className="field-input"
                min={todayStr}
                value={departureDate}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  if (errors.departureDate) {
                    setErrors((prev) => ({ ...prev, departureDate: null }));
                  }
                  if (returnDate && returnDate < e.target.value) {
                    setReturnDate(e.target.value);
                  }
                }}
              />
            </div>
            {errors.departureDate && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.departureDate}
              </span>
            )}
          </div>

          {/* Return Date (if round-trip) */}
          <div className="search-field">
            <label
              htmlFor="ret-date"
              className="field-label"
              style={{ opacity: tripType === 'roundTrip' ? 1 : 0.6 }}
            >
              <Calendar size={15} className="field-icon" />
              <span>Return Date {tripType === 'oneWay' && '(Optional)'}</span>
            </label>
            <div
              className={`field-input-box ${errors.returnDate ? 'has-error' : ''}`}
              style={{
                opacity: tripType === 'roundTrip' ? 1 : 0.6,
                backgroundColor: tripType === 'roundTrip' ? 'var(--color-bg-light)' : '#F6F9FD'
              }}
            >
              <input
                id="ret-date"
                type="date"
                className="field-input"
                min={departureDate || todayStr}
                disabled={tripType !== 'roundTrip'}
                value={tripType === 'roundTrip' ? returnDate : ''}
                placeholder={tripType === 'oneWay' ? 'One-way Trip' : ''}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  if (errors.returnDate) {
                    setErrors((prev) => ({ ...prev, returnDate: null }));
                  }
                }}
              />
            </div>
            {errors.returnDate && tripType === 'roundTrip' && (
              <span className="field-error-msg">
                <AlertCircle size={13} /> {errors.returnDate}
              </span>
            )}
          </div>
        </div>

        {/* Secondary Row: Adults/Passengers + Cabin Class + Submit Button */}
        <div className="search-secondary-row">
          {/* Adults / Passengers count */}
          <div className="search-field">
            <label htmlFor="passenger-count" className="field-label">
              <Users size={15} className="field-icon" />
              <span>Travellers</span>
            </label>
            <div className="field-input-box">
              <select
                id="passenger-count"
                className="field-select"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                <option value={1}>1 Traveller (Adult)</option>
                <option value={2}>2 Travellers</option>
                <option value={3}>3 Travellers</option>
                <option value={4}>4 Travellers</option>
                <option value={5}>5 Travellers</option>
                <option value={6}>6 Travellers</option>
              </select>
            </div>
          </div>

          {/* Cabin Class */}
          <div className="search-field">
            <label htmlFor="cabin-class" className="field-label">
              <Briefcase size={15} className="field-icon" />
              <span>Class of Travel</span>
            </label>
            <div className="field-input-box">
              <select
                id="cabin-class"
                className="field-select"
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
                <option value="First">First Class</option>
              </select>
            </div>
          </div>

          {/* Search Flights Submit Button */}
          <div className="search-field">
            <button
              type="submit"
              className="btn btn-primary search-submit-btn"
              id="search-flights-submit"
            >
              <Search size={18} />
              <span>Search {flightCategory === 'domestic' ? 'Domestic' : 'International'} Flights</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
