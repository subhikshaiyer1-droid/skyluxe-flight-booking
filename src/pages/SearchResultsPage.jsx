import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import FlightCard from '../components/FlightCard';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightCompareModal from '../components/FlightCompareModal';
import { getFlightsForRoute, getFlexibleDateFares } from '../data/flights';
import { getAirportByCode, isDomesticRoute } from '../data/airports';
import {
  Plane,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Calendar,
  Users,
  Briefcase,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  TrendingDown,
  Globe,
  Clock,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Query Params with defaults
  const fromCode = searchParams.get('from') || 'BOM';
  const toCode = searchParams.get('to') || 'DEL';
  const departureDate = searchParams.get('departureDate') || new Date().toISOString().split('T')[0];
  const returnDate = searchParams.get('returnDate') || '';
  const tripType = searchParams.get('tripType') || 'oneWay';
  const passengers = Number(searchParams.get('passengers') || 1);
  const cabinClass = searchParams.get('cabinClass') || 'Economy';

  const fromAirport = getAirportByCode(fromCode);
  const toAirport = getAirportByCode(toCode);
  const isDomestic = isDomesticRoute(fromCode, toCode);

  // Toggle collapsible "Modify Search" panel
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Compared Flights State (max 3)
  const [comparedFlights, setComparedFlights] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Generate base flights for this route and cabin class
  const baseFlights = useMemo(() => {
    return getFlightsForRoute(fromCode, toCode, cabinClass);
  }, [fromCode, toCode, cabinClass]);

  // Determine price limits for slider
  const prices = baseFlights.map((f) => f.price);
  const minPossiblePrice = prices.length > 0 ? Math.min(...prices) : 1000;
  const maxPossiblePrice = prices.length > 0 ? Math.max(...prices) : 80000;

  // Determine duration limits in hours
  const durations = baseFlights.map((f) => f.durationMinutes);
  const maxPossibleDurationHours = durations.length > 0
    ? Math.ceil(Math.max(...durations) / 60)
    : 24;

  // ----------------------------------------------------
  // FILTER STATES (Section 4 Requirements)
  // ----------------------------------------------------
  const [selectedSort, setSelectedSort] = useState('cheapest'); // 'cheapest' | 'fastest' | 'earliest'
  const [minPriceFilter, setMinPriceFilter] = useState(minPossiblePrice);
  const [maxPriceFilter, setMaxPriceFilter] = useState(maxPossiblePrice);

  // Stops: 'all' | 'nonStop' | 'oneStop'
  const [stopsFilter, setStopsFilter] = useState('all');

  // Departure Time Windows: Array of strings e.g. ['morning', 'evening']
  const [selectedDepTimes, setSelectedDepTimes] = useState([]);

  // Arrival Time Windows: Array of strings
  const [selectedArrTimes, setSelectedArrTimes] = useState([]);

  // Max Duration Filter (in hours)
  const [maxDurationHours, setMaxDurationHours] = useState(maxPossibleDurationHours);

  // Baggage Allowance Filter: 'all' | '15kg' | '20kg' | '25kg' | '30kg'
  const [baggageFilter, setBaggageFilter] = useState('all');

  // Refundable or Flexible Fare only
  const [refundableOnly, setRefundableOnly] = useState(false);

  // Airline Checkbox Filters
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  // Flexible Date Prices
  const flexibleDates = useMemo(() => {
    return getFlexibleDateFares(fromCode, toCode, departureDate, cabinClass);
  }, [fromCode, toCode, departureDate, cabinClass]);

  // Handler to switch selected departure date from the flexible calendar
  const handleSelectDate = (newDateStr) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('departureDate', newDateStr);
    setSearchParams(updated);
  };

  // Reset all filters back to default
  const handleResetFilters = () => {
    setMinPriceFilter(minPossiblePrice);
    setMaxPriceFilter(maxPossiblePrice);
    setStopsFilter('all');
    setSelectedDepTimes([]);
    setSelectedArrTimes([]);
    setMaxDurationHours(maxPossibleDurationHours);
    setBaggageFilter('all');
    setRefundableOnly(false);
    setSelectedAirlines([]);
    setSelectedSort('cheapest');
  };

  // Toggle airline in filter
  const handleAirlineToggle = (airlineName) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineName)
        ? prev.filter((a) => a !== airlineName)
        : [...prev, airlineName]
    );
  };

  // Toggle departure time window
  const handleDepTimeToggle = (windowKey) => {
    setSelectedDepTimes((prev) =>
      prev.includes(windowKey)
        ? prev.filter((w) => w !== windowKey)
        : [...prev, windowKey]
    );
  };

  // Toggle arrival time window
  const handleArrTimeToggle = (windowKey) => {
    setSelectedArrTimes((prev) =>
      prev.includes(windowKey)
        ? prev.filter((w) => w !== windowKey)
        : [...prev, windowKey]
    );
  };

  // Cabin Class Change
  const handleCabinClassChange = (newClass) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('cabinClass', newClass);
    setSearchParams(updated);
  };

  // Helper to categorize time string "HH:MM" into window
  const getTimeWindow = (timeStr) => {
    if (!timeStr) return 'morning';
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 6 && hour < 12) return 'morning'; // 06:00 - 11:59
    if (hour >= 12 && hour < 18) return 'afternoon'; // 12:00 - 17:59
    if (hour >= 18 && hour < 22) return 'evening'; // 18:00 - 21:59
    return 'night'; // 22:00 - 05:59
  };

  // Compare flight toggle
  const handleToggleCompare = (flight) => {
    setComparedFlights((prev) => {
      const exists = prev.some((f) => f.id === flight.id);
      if (exists) {
        return prev.filter((f) => f.id !== flight.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 flights at a time.');
        return prev;
      }
      return [...prev, flight];
    });
  };

  const handleRemoveComparedFlight = (flightId) => {
    setComparedFlights((prev) => prev.filter((f) => f.id !== flightId));
  };

  // Available airlines list with counts
  const availableAirlines = useMemo(() => {
    const map = new Map();
    baseFlights.forEach((f) => {
      map.set(f.airline, (map.get(f.airline) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [baseFlights]);

  // ----------------------------------------------------
  // DYNAMIC FILTERING AND SORTING
  // ----------------------------------------------------
  const filteredAndSortedFlights = useMemo(() => {
    let result = [...baseFlights];

    // 1. Price Range filter
    result = result.filter(
      (f) => f.price >= minPriceFilter && f.price <= maxPriceFilter
    );

    // 2. Stops filter
    if (stopsFilter === 'nonStop') {
      result = result.filter((f) => f.stops === 0);
    } else if (stopsFilter === 'oneStop') {
      result = result.filter((f) => f.stops === 1);
    }

    // 3. Departure Time Window filter
    if (selectedDepTimes.length > 0) {
      result = result.filter((f) =>
        selectedDepTimes.includes(getTimeWindow(f.departureTime))
      );
    }

    // 4. Arrival Time Window filter
    if (selectedArrTimes.length > 0) {
      result = result.filter((f) =>
        selectedArrTimes.includes(getTimeWindow(f.arrivalTime))
      );
    }

    // 5. Max Duration filter
    result = result.filter(
      (f) => f.durationMinutes <= maxDurationHours * 60
    );

    // 6. Baggage Allowance filter
    if (baggageFilter !== 'all') {
      const minKg = parseInt(baggageFilter, 10);
      result = result.filter((f) => {
        const match = f.baggage?.match(/(\d+)kg Check-in/i);
        if (match) {
          const kg = parseInt(match[1], 10);
          return kg >= minKg;
        }
        return true;
      });
    }

    // 7. Refundable / Flexible filter
    if (refundableOnly) {
      result = result.filter((f) => Boolean(f.refundable));
    }

    // 8. Airline filter
    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(f.airline));
    }

    // 9. Sorting
    if (selectedSort === 'cheapest') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'fastest') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (selectedSort === 'earliest') {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return result;
  }, [
    baseFlights,
    minPriceFilter,
    maxPriceFilter,
    stopsFilter,
    selectedDepTimes,
    selectedArrTimes,
    maxDurationHours,
    baggageFilter,
    refundableOnly,
    selectedAirlines,
    selectedSort
  ]);

  // Identify absolute cheapest and fastest flights in current results
  const cheapestFlightId = useMemo(() => {
    if (filteredAndSortedFlights.length === 0) return null;
    let minF = filteredAndSortedFlights[0];
    filteredAndSortedFlights.forEach((f) => {
      if (f.price < minF.price) minF = f;
    });
    return minF.id;
  }, [filteredAndSortedFlights]);

  const fastestFlightId = useMemo(() => {
    if (filteredAndSortedFlights.length === 0) return null;
    let fastF = filteredAndSortedFlights[0];
    filteredAndSortedFlights.forEach((f) => {
      if (f.durationMinutes < fastF.durationMinutes) fastF = f;
    });
    return fastF.id;
  }, [filteredAndSortedFlights]);

  return (
    <div className="search-results-page">
      {/* --------------------------------------------------------------------
          1. Header Route Summary Bar with Domestic / International Badge
          -------------------------------------------------------------------- */}
      <div className="results-page-header">
        <div className="container">
          {/* Domestic / International Journey Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span
              className="badge"
              style={{
                background: isDomestic ? 'rgba(38, 132, 255, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                color: isDomestic ? 'var(--color-primary)' : '#7E22CE',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '5px 12px'
              }}
            >
              {isDomestic ? '🇮🇳 Domestic Flight (Within India)' : '🌐 International Flight'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {isDomestic
                ? 'Standard Domestic Check-in • Government ID Required'
                : `Local Timezone: ${toAirport?.timezone || 'Destination Local'} • Passport Required`}
            </span>
          </div>

          <div className="route-summary-bar">
            <div className="route-info-left">
              <div>
                <h1 className="route-airports-title">
                  <span>{fromAirport?.flag} {fromAirport?.city} ({fromAirport?.code})</span>
                  <ArrowRight size={22} color="var(--color-primary)" />
                  <span>{toAirport?.flag} {toAirport?.city} ({toAirport?.code})</span>
                </h1>

                <div className="route-meta-pills">
                  <span className="route-meta-pill">
                    <Calendar size={13} color="var(--color-primary)" />
                    <span>Dep: {departureDate}</span>
                  </span>
                  {tripType === 'roundTrip' && returnDate && (
                    <span className="route-meta-pill">
                      <Calendar size={13} color="var(--color-orange)" />
                      <span>Ret: {returnDate}</span>
                    </span>
                  )}
                  <span className="route-meta-pill">
                    <Users size={13} />
                    <span>{passengers} {passengers > 1 ? 'Travellers' : 'Traveller'}</span>
                  </span>
                  <span className="route-meta-pill">
                    <Briefcase size={13} />
                    <span>{cabinClass}</span>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {comparedFlights.length > 0 && (
                <button
                  type="button"
                  className="btn btn-orange btn-sm"
                  onClick={() => setIsCompareModalOpen(true)}
                >
                  <Layers size={16} />
                  <span>Compare ({comparedFlights.length})</span>
                </button>
              )}

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModifySearch(!showModifySearch)}
                id="modify-search-toggle"
              >
                <span>{showModifySearch ? 'Hide Search' : 'Modify Search'}</span>
                {showModifySearch ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Collapsible Modify Search Box */}
          {showModifySearch && (
            <div style={{ marginTop: '24px' }}>
              <FlightSearchForm
                initialValues={{
                  from: fromCode,
                  to: toCode,
                  departureDate,
                  returnDate,
                  tripType,
                  passengers,
                  cabinClass,
                  flightCategory: isDomestic ? 'domestic' : 'international'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. Flexible Date Price Calendar Strip
          -------------------------------------------------------------------- */}
      <div className="date-strip-wrapper">
        <div className="container">
          <div className="date-strip-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} color="var(--color-primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-navy)' }}>
                Flexible Dates & Estimated Fares
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
              *Illustrative demo fares for nearby dates. Click to view flights for that date.
            </span>
          </div>

          <div className="date-strip-cards">
            {flexibleDates.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                className={`date-strip-card ${item.isSelected ? 'is-selected' : ''} ${item.isLowest ? 'is-lowest' : ''}`}
                onClick={() => handleSelectDate(item.dateStr)}
                title={`View flights on ${item.formattedDisplay}`}
              >
                {item.isLowest && (
                  <span className="date-strip-best-badge">
                    <TrendingDown size={10} /> Lowest Fare
                  </span>
                )}
                <span className="date-strip-day">{item.dayName}</span>
                <span className="date-strip-date">{item.formattedDisplay}</span>
                <span className="date-strip-price">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          3. Results Layout (Advanced Filter Sidebar + Flights List)
          -------------------------------------------------------------------- */}
      <div className="container" style={{ paddingBottom: '60px' }}>
        <div className="results-layout">
          {/* Advanced Filter Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-navy)' }}>
                <Filter size={18} color="var(--color-primary)" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleResetFilters}
                style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'transparent' }}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset All</span>
              </button>
            </div>

            {/* Cabin Class Quick Selector */}
            <div className="filter-group">
              <h4 className="filter-group-title">Cabin Class</h4>
              <select
                className="field-select"
                value={cabinClass}
                onChange={(e) => handleCabinClassChange(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
                <option value="First">First Class</option>
              </select>
            </div>

            {/* Price Slider Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Price Range</h4>
              <div className="price-slider-wrap">
                <div className="price-slider-label">
                  <span>Up to</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                    ₹{Number(maxPriceFilter).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  className="price-range-input"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={500}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  id="price-range-slider"
                />
              </div>
            </div>

            {/* Stops Filter (Non-stop, 1-stop, Multi-stop) */}
            <div className="filter-group">
              <h4 className="filter-group-title">Stops</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="stopsFilter"
                    checked={stopsFilter === 'all'}
                    onChange={() => setStopsFilter('all')}
                  />
                  <span>All Flights</span>
                </label>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="stopsFilter"
                    checked={stopsFilter === 'nonStop'}
                    onChange={() => setStopsFilter('nonStop')}
                    id="non-stop-radio"
                  />
                  <span>Non-stop flights only</span>
                </label>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="stopsFilter"
                    checked={stopsFilter === 'oneStop'}
                    onChange={() => setStopsFilter('oneStop')}
                  />
                  <span>1-Stop / Connecting</span>
                </label>
              </div>
            </div>

            {/* Departure Time Windows Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Departure Time</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'morning', label: 'Morning', hours: '6am - 12pm' },
                  { key: 'afternoon', label: 'Afternoon', hours: '12pm - 6pm' },
                  { key: 'evening', label: 'Evening', hours: '6pm - 10pm' },
                  { key: 'night', label: 'Night', hours: '10pm - 6am' }
                ].map((item) => (
                  <button
                    key={`dep-${item.key}`}
                    type="button"
                    onClick={() => handleDepTimeToggle(item.key)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedDepTimes.includes(item.key)
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      background: selectedDepTimes.includes(item.key)
                        ? 'var(--color-primary-light)'
                        : 'white',
                      color: selectedDepTimes.includes(item.key)
                        ? 'var(--color-primary)'
                        : 'var(--color-navy)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{item.hours}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Arrival Time Windows Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Arrival Time</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'morning', label: 'Morning', hours: '6am - 12pm' },
                  { key: 'afternoon', label: 'Afternoon', hours: '12pm - 6pm' },
                  { key: 'evening', label: 'Evening', hours: '6pm - 10pm' },
                  { key: 'night', label: 'Night', hours: '10pm - 6am' }
                ].map((item) => (
                  <button
                    key={`arr-${item.key}`}
                    type="button"
                    onClick={() => handleArrTimeToggle(item.key)}
                    style={{
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedArrTimes.includes(item.key)
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      background: selectedArrTimes.includes(item.key)
                        ? 'var(--color-primary-light)'
                        : 'white',
                      color: selectedArrTimes.includes(item.key)
                        ? 'var(--color-primary)'
                        : 'var(--color-navy)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{item.hours}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Journey Duration Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Maximum Duration</h4>
              <div className="price-slider-wrap">
                <div className="price-slider-label">
                  <span>Up to</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                    {maxDurationHours}h 00m
                  </span>
                </div>
                <input
                  type="range"
                  className="price-range-input"
                  min={2}
                  max={maxPossibleDurationHours}
                  step={1}
                  value={maxDurationHours}
                  onChange={(e) => setMaxDurationHours(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Baggage Allowance Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Check-in Baggage</h4>
              <select
                className="field-select"
                value={baggageFilter}
                onChange={(e) => setBaggageFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="all">Any Baggage Allowance</option>
                <option value="15kg">At least 15 kg Check-in</option>
                <option value="20kg">At least 20 kg Check-in</option>
                <option value="25kg">At least 25 kg Check-in</option>
                <option value="30kg">30 kg or more Check-in</option>
              </select>
            </div>

            {/* Refundable Fares Only */}
            <div className="filter-group">
              <h4 className="filter-group-title">Fare Flexibility</h4>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={refundableOnly}
                  onChange={(e) => setRefundableOnly(e.target.checked)}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} color="var(--color-success)" />
                  Refundable Fares Only
                </span>
              </label>
            </div>

            {/* Airlines Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Airlines</h4>
              {availableAirlines.map((airline) => (
                <label key={airline.name} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    className="filter-checkbox"
                    checked={selectedAirlines.includes(airline.name)}
                    onChange={() => handleAirlineToggle(airline.name)}
                  />
                  <span>{airline.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    ({airline.count})
                  </span>
                </label>
              ))}
            </div>

            {/* Quick Compare Summary Box in Sidebar */}
            {comparedFlights.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #BFDBFE'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Comparing {comparedFlights.length}/3 Flights
                  </span>
                  <button
                    type="button"
                    onClick={() => setComparedFlights([])}
                    style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                  onClick={() => setIsCompareModalOpen(true)}
                >
                  <Layers size={14} />
                  <span>Open Comparison</span>
                </button>
              </div>
            )}
          </aside>

          {/* Flights List & Sort Bar */}
          <main className="results-main">
            {/* Sorting Controls */}
            <div className="sort-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: 'var(--color-navy)', fontWeight: 600 }}>
                <SlidersHorizontal size={16} color="var(--color-primary)" />
                <span>
                  Showing <strong>{filteredAndSortedFlights.length}</strong> of {baseFlights.length} available flights
                </span>
              </div>

              <div className="sort-options">
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Sort:</span>
                <button
                  className={`sort-btn ${selectedSort === 'cheapest' ? 'active' : ''}`}
                  onClick={() => setSelectedSort('cheapest')}
                  id="sort-cheapest"
                >
                  Cheapest
                </button>
                <button
                  className={`sort-btn ${selectedSort === 'fastest' ? 'active' : ''}`}
                  onClick={() => setSelectedSort('fastest')}
                  id="sort-fastest"
                >
                  Fastest
                </button>
                <button
                  className={`sort-btn ${selectedSort === 'earliest' ? 'active' : ''}`}
                  onClick={() => setSelectedSort('earliest')}
                  id="sort-earliest"
                >
                  Earliest Departure
                </button>
              </div>
            </div>

            {/* Flight Cards rendering */}
            {filteredAndSortedFlights.length > 0 ? (
              filteredAndSortedFlights.map((flight) => {
                const isCompared = comparedFlights.some((f) => f.id === flight.id);
                const isCheapest = flight.id === cheapestFlightId;
                const isFastest = flight.id === fastestFlightId;

                return (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    searchParams={{
                      from: fromCode,
                      to: toCode,
                      departureDate,
                      returnDate,
                      tripType,
                      passengers,
                      cabinClass
                    }}
                    isCheapest={isCheapest}
                    isFastest={isFastest}
                    isCompared={isCompared}
                    onToggleCompare={handleToggleCompare}
                  />
                );
              })
            ) : (
              /* Friendly Empty State with Reset Filters */
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
                  <AlertCircle size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-navy)' }}>
                  No flights match your current filters
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Try relaxing your price range, clearing time-of-day filters, or checking multiple stops.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={15} />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Compare Bar (when flights are selected) */}
      {comparedFlights.length > 0 && !isCompareModalOpen && (
        <div className="floating-compare-bar">
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                background: 'var(--color-orange)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {comparedFlights.length}
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-navy)', fontSize: '0.95rem' }}>
                  {comparedFlights.length} {comparedFlights.length === 1 ? 'Flight' : 'Flights'} Selected to Compare
                </span>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Compare price, flight duration, stops, baggage, and amenities side-by-side.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setComparedFlights([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsCompareModalOpen(true)}
              >
                <Layers size={16} />
                <span>Compare Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Compare Modal */}
      <FlightCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        flights={comparedFlights}
        searchParams={{
          from: fromCode,
          to: toCode,
          departureDate,
          returnDate,
          tripType,
          passengers,
          cabinClass
        }}
        onRemoveFlight={handleRemoveComparedFlight}
      />
    </div>
  );
}
