import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import FlightCard from '../components/FlightCard';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightCompareModal from '../components/FlightCompareModal';
import { getFlightsForRoute, getFlexibleDateFares } from '../data/flights';
import { getAirportByCode } from '../data/airports';
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
  const maxPossiblePrice = prices.length > 0 ? Math.max(...prices) : 50000;

  // Filter States
  const [selectedSort, setSelectedSort] = useState('cheapest'); // 'cheapest' | 'fastest' | 'earliest'
  const [maxPrice, setMaxPrice] = useState(maxPossiblePrice);
  const [nonStopOnly, setNonStopOnly] = useState(false);
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

  // Reset filters
  const handleResetFilters = () => {
    setMaxPrice(maxPossiblePrice);
    setNonStopOnly(false);
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

  // Filter and sort the flights dynamically
  const filteredAndSortedFlights = useMemo(() => {
    let result = [...baseFlights];

    // Filter by max price
    result = result.filter((f) => f.price <= maxPrice);

    // Filter by non-stop
    if (nonStopOnly) {
      result = result.filter((f) => f.stops === 0);
    }

    // Filter by airlines
    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(f.airline));
    }

    // Sort flights
    if (selectedSort === 'cheapest') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'fastest') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (selectedSort === 'earliest') {
      result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return result;
  }, [baseFlights, maxPrice, nonStopOnly, selectedAirlines, selectedSort]);

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

  // Available airlines list
  const availableAirlines = useMemo(() => {
    const map = new Map();
    baseFlights.forEach((f) => {
      map.set(f.airline, (map.get(f.airline) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [baseFlights]);

  return (
    <div className="search-results-page">
      {/* --------------------------------------------------------------------
          1. Header Route Summary Bar
          -------------------------------------------------------------------- */}
      <div className="results-page-header">
        <div className="container">
          <div className="route-summary-bar">
            <div className="route-info-left">
              <div>
                <h1 className="route-airports-title">
                  <span>{fromAirport.city} ({fromAirport.code})</span>
                  <ArrowRight size={22} color="var(--color-primary)" />
                  <span>{toAirport.city} ({toAirport.code})</span>
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
                    <span>{passengers} {passengers > 1 ? 'Passengers' : 'Passenger'}</span>
                  </span>
                  <span className="route-meta-pill">
                    <Briefcase size={13} />
                    <span>{cabinClass}</span>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
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
                <span>{showModifySearch ? 'Hide Search Form' : 'Modify Search'}</span>
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
                  cabinClass
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
              *Simulated demo prices for nearby dates. Click to view flights for that day.
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
                    <TrendingDown size={10} /> Best Fare
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
          3. Results Layout (Filter Sidebar + Flight Cards List)
          -------------------------------------------------------------------- */}
      <div className="container">
        <div className="results-layout">
          {/* Filter Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-navy)' }}>
                <Filter size={18} color="var(--color-primary)" />
                <span>Filter Flights</span>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleResetFilters}
                style={{ padding: '4px 8px', fontSize: '0.78rem', color: 'var(--color-text-muted)', background: 'transparent' }}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* Price Slider Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Maximum Price</h4>
              <div className="price-slider-wrap">
                <div className="price-slider-label">
                  <span>₹{minPossiblePrice.toLocaleString('en-IN')}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                    ₹{Number(maxPrice).toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  className="price-range-input"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  id="price-range-slider"
                />
              </div>
            </div>

            {/* Stops Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">Stops</h4>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={nonStopOnly}
                  onChange={(e) => setNonStopOnly(e.target.checked)}
                  id="non-stop-checkbox"
                />
                <span>Non-stop flights only</span>
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
                    style={{ background: 'none', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}
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
                  Showing <strong>{filteredAndSortedFlights.length}</strong> of {baseFlights.length} flights
                </span>
              </div>

              <div className="sort-options">
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Sort by:</span>
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
              /* Friendly Empty State */
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
                  No flights match your filters
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Try adjusting the maximum price slider, deselecting specific airlines, or unchecking the non-stop filter.
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
