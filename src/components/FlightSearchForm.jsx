import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIRPORTS } from '../data/airports';
import {
  ArrowLeftRight,
  Calendar,
  Users,
  Search,
  PlaneTakeoff,
  PlaneLanding,
  Briefcase,
  AlertCircle
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

  // Form State
  const [tripType, setTripType] = useState(initialValues.tripType || 'oneWay');
  const [origin, setOrigin] = useState(initialValues.from || 'BOM');
  const [destination, setDestination] = useState(initialValues.to || 'DEL');
  const [departureDate, setDepartureDate] = useState(initialValues.departureDate || todayStr);
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || '');
  const [passengers, setPassengers] = useState(initialValues.passengers ? Number(initialValues.passengers) : 1);
  const [cabinClass, setCabinClass] = useState(initialValues.cabinClass || 'Economy');

  // Error State for friendly validation
  const [errors, setErrors] = useState({});

  // Swap airports handler
  const handleSwapAirports = () => {
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
      newErrors.origin = 'Please select an origin city.';
    }
    if (!destination) {
      newErrors.destination = 'Please select a destination city.';
    }

    // 2. Origin and destination cannot be identical
    if (origin && destination && origin.toUpperCase() === destination.toUpperCase()) {
      newErrors.destination = 'Origin and destination cannot be identical.';
    }

    // 3. Departure date cannot be in the past
    if (!departureDate) {
      newErrors.departureDate = 'Departure date is required.';
    } else if (departureDate < todayStr) {
      newErrors.departureDate = 'Departure date cannot be in the past.';
    }

    // 4. Return date cannot be earlier than departure date if round-trip
    if (tripType === 'roundTrip') {
      if (!returnDate) {
        newErrors.returnDate = 'Return date is required for round trips.';
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

    const queryParams = new URLSearchParams({
      from: origin,
      to: destination,
      departureDate,
      tripType,
      passengers: String(passengers),
      cabinClass
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
        cabinClass
      });
    } else {
      navigate(`/search?${queryParams.toString()}`);
    }
  };

  return (
    <div className={`search-card ${compact ? 'search-card-compact' : ''}`}>
      {/* Trip Type Pills */}
      <div className="trip-type-selector">
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
              // Default return date to 3 days after departure
              const nextDate = new Date(departureDate || todayStr);
              nextDate.setDate(nextDate.getDate() + 3);
              setReturnDate(formatDateString(nextDate));
            }
          }}
        >
          <span>Round-trip</span>
        </button>

        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
          ✈️ Demo Flight Finder
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Main Fields Grid: Origin - Swap - Destination - Departure Date - Return Date */}
        <div className="search-fields-grid">
          {/* Origin Airport */}
          <div className="search-field">
            <label htmlFor="origin-airport" className="field-label">
              <PlaneTakeoff size={15} className="field-icon" />
              <span>From Airport</span>
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
                {AIRPORTS.map((airport) => (
                  <option key={`from-${airport.code}`} value={airport.code}>
                    {airport.flag} {airport.city} ({airport.code})
                  </option>
                ))}
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
              <span>To Airport</span>
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
                {AIRPORTS.map((airport) => (
                  <option key={`to-${airport.code}`} value={airport.code}>
                    {airport.flag} {airport.city} ({airport.code})
                  </option>
                ))}
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
                  // If return date is now earlier than departure date, update it
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

        {/* Secondary Row: Adults/Passengers + Cabin Class + Search Button */}
        <div className="search-secondary-row">
          {/* Adults / Passengers count */}
          <div className="search-field">
            <label htmlFor="passenger-count" className="field-label">
              <Users size={15} className="field-icon" />
              <span>Passengers (Adults)</span>
            </label>
            <div className="field-input-box">
              <select
                id="passenger-count"
                className="field-select"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                <option value={1}>1 Adult (Age 12+)</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4 Adults</option>
                <option value={5}>5 Adults</option>
              </select>
            </div>
          </div>

          {/* Cabin Class */}
          <div className="search-field">
            <label htmlFor="cabin-class" className="field-label">
              <Briefcase size={15} className="field-icon" />
              <span>Cabin Class</span>
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
                <option value="Business">Business</option>
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
              <span>Search Flights</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
