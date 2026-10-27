import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Plane,
  Calendar,
  Clock,
  Sparkles,
  Save,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AIRPORTS, getAirportByCode } from '../data/airports';
import {
  getSavedMultiCityItineraries,
  saveMultiCityItinerary,
  deleteMultiCityItinerary
} from '../utils/plannerStorage';

// Estimated fare generator based on route type
function estimateLegFare(fromCode, toCode) {
  const fromAp = getAirportByCode(fromCode);
  const toAp = getAirportByCode(toCode);
  const isDomestic = fromAp?.isDomestic && toAp?.isDomestic;

  if (isDomestic) {
    // Domestic estimate: ₹3,800 - ₹6,500
    const hash = (fromCode.charCodeAt(0) + toCode.charCodeAt(0)) % 5;
    return 4200 + hash * 550;
  } else {
    // International estimate: ₹14,000 - ₹38,000
    const hash = (fromCode.charCodeAt(0) + toCode.charCodeAt(1)) % 8;
    return 16500 + hash * 2400;
  }
}

function estimateLegDuration(fromCode, toCode) {
  const fromAp = getAirportByCode(fromCode);
  const toAp = getAirportByCode(toCode);
  const isDomestic = fromAp?.isDomestic && toAp?.isDomestic;
  if (isDomestic) {
    return '2h 15m (Non-stop)';
  } else {
    return '4h 45m - 8h 20m (Direct/1-Stop)';
  }
}

// Sample presets for quick exploration
const PRESET_ITINERARIES = [
  {
    name: 'Southeast Asia Express',
    description: 'Mumbai → Singapore → Kuala Lumpur → Bangkok → Mumbai',
    stops: ['BOM', 'SIN', 'KUL', 'BKK', 'BOM']
  },
  {
    name: 'Golden Triangle & Spiritual India',
    description: 'Delhi → Jaipur → Varanasi → Mumbai → Delhi',
    stops: ['DEL', 'JAI', 'VNS', 'BOM', 'DEL']
  },
  {
    name: 'Classic European Triangle',
    description: 'Delhi → London → Paris → Zurich → Delhi',
    stops: ['DEL', 'LHR', 'CDG', 'ZRH', 'DEL']
  },
  {
    name: 'Arabian Gulf Exploration',
    description: 'Mumbai → Dubai → Doha → Abu Dhabi → Mumbai',
    stops: ['BOM', 'DXB', 'DOH', 'AUH', 'BOM']
  }
];

export default function MultiCityPlannerPage() {
  const navigate = useNavigate();

  // Initial default: BOM -> SIN -> KUL -> BKK -> BOM
  const [itineraryName, setItineraryName] = useState('Southeast Asia Hop');
  const [stops, setStops] = useState([
    { id: 'stop-1', airportCode: 'BOM', date: '2026-11-10' },
    { id: 'stop-2', airportCode: 'SIN', date: '2026-11-14' },
    { id: 'stop-3', airportCode: 'KUL', date: '2026-11-18' },
    { id: 'stop-4', airportCode: 'BKK', date: '2026-11-22' },
    { id: 'stop-5', airportCode: 'BOM', date: '2026-11-26' }
  ]);

  const [savedList, setSavedList] = useState([]);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setSavedList(getSavedMultiCityItineraries());

    const handleUpdate = () => {
      setSavedList(getSavedMultiCityItineraries());
    };
    window.addEventListener('skyluxe_multicity_updated', handleUpdate);
    return () => window.removeEventListener('skyluxe_multicity_updated', handleUpdate);
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Add stop
  const handleAddStop = () => {
    const lastStop = stops[stops.length - 1];
    let nextDate = '2026-11-28';
    if (lastStop?.date) {
      const d = new Date(lastStop.date);
      d.setDate(d.getDate() + 4);
      nextDate = d.toISOString().split('T')[0];
    }
    const newStop = {
      id: `stop-${Date.now()}`,
      airportCode: 'DXB',
      date: nextDate
    };
    setStops([...stops, newStop]);
  };

  // Remove stop
  const handleRemoveStop = (index) => {
    if (stops.length <= 2) {
      showToast('An itinerary requires at least 2 destinations.');
      return;
    }
    const updated = stops.filter((_, i) => i !== index);
    setStops(updated);
  };

  // Move stop up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...stops];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setStops(updated);
  };

  // Move stop down
  const handleMoveDown = (index) => {
    if (index === stops.length - 1) return;
    const updated = [...stops];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setStops(updated);
  };

  // Update stop airport code
  const handleAirportChange = (index, newCode) => {
    const updated = [...stops];
    updated[index].airportCode = newCode;
    setStops(updated);
  };

  // Update stop date
  const handleDateChange = (index, newDate) => {
    const updated = [...stops];
    updated[index].date = newDate;
    setStops(updated);
  };

  // Load preset
  const handleLoadPreset = (preset) => {
    setItineraryName(preset.name);
    const baseDate = new Date('2026-11-10');
    const newStops = preset.stops.map((code, idx) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + idx * 4);
      return {
        id: `preset-${idx}-${Date.now()}`,
        airportCode: code,
        date: d.toISOString().split('T')[0]
      };
    });
    setStops(newStops);
    showToast(`Loaded preset "${preset.name}".`);
  };

  // Calculate legs
  const legs = [];
  let totalEstFare = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const fromCode = stops[i].airportCode;
    const toCode = stops[i + 1].airportCode;
    const fare = estimateLegFare(fromCode, toCode);
    const duration = estimateLegDuration(fromCode, toCode);
    totalEstFare += fare;
    legs.push({
      legIndex: i + 1,
      fromCode,
      toCode,
      departureDate: stops[i].date,
      estFare: fare,
      estDuration: duration
    });
  }

  // Calculate total trip span in days
  let totalSpanDays = 0;
  if (stops.length >= 2 && stops[0].date && stops[stops.length - 1].date) {
    const d1 = new Date(stops[0].date);
    const d2 = new Date(stops[stops.length - 1].date);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    totalSpanDays = diff > 0 ? diff : 1;
  }

  // Save current itinerary
  const handleSaveItinerary = () => {
    if (!itineraryName.trim()) {
      showToast('Please enter an itinerary name before saving.');
      return;
    }
    const record = {
      name: itineraryName.trim(),
      stops,
      totalEstFare,
      totalSpanDays,
      legsCount: legs.length
    };
    saveMultiCityItinerary(record);
    showToast(`Itinerary "${itineraryName}" saved successfully!`);
  };

  // Load saved itinerary
  const handleLoadSaved = (item) => {
    setItineraryName(item.name || 'Saved Multi-City Trip');
    if (Array.isArray(item.stops)) {
      setStops(item.stops);
    }
    showToast(`Loaded saved itinerary "${item.name}".`);
  };

  // Delete saved itinerary
  const handleDeleteSaved = (id, e) => {
    e.stopPropagation();
    deleteMultiCityItinerary(id);
    showToast('Saved itinerary deleted.');
  };

  // Trigger search for specific flight leg
  const handleSearchLeg = (leg) => {
    navigate(`/search?from=${leg.fromCode}&to=${leg.toCode}&date=${leg.departureDate}&type=one-way&passengers=1&class=Economy`);
  };

  return (
    <div className="multi-city-page section-pad">
      <div className="container">
        {/* Page Header */}
        <div className="page-header text-center" style={{ marginBottom: '32px' }}>
          <div className="badge badge-primary section-badge">
            <Compass size={14} />
            <span>Multi-Stop Hop-on Journey</span>
          </div>
          <h1 className="page-title">Multi-City Itinerary Planner</h1>
          <p className="page-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
            Plan complex routes with multiple flight legs, customize travel dates, view an interactive travel timeline, and check individual flight options with one click.
          </p>
        </div>

        {/* Toast Alert */}
        {notification && (
          <div className="alert alert-success" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Preset Inspiration Pills */}
        <div className="planner-presets-card" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={16} color="var(--color-orange)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
              Quick Itinerary Presets:
            </span>
          </div>
          <div className="preset-buttons-row">
            {PRESET_ITINERARIES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="btn btn-outline btn-sm preset-pill"
                onClick={() => handleLoadPreset(preset)}
                title={preset.description}
              >
                <span>{preset.name}</span>
                <span className="preset-pill-sub">({preset.stops.length} stops)</span>
              </button>
            ))}
          </div>
        </div>

        <div className="planner-layout-grid">
          {/* LEFT: Editor Panel */}
          <div className="planner-editor-panel">
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Itinerary Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={itineraryName}
                    onChange={(e) => setItineraryName(e.target.value)}
                    placeholder="e.g. My Southeast Asia Tour"
                    style={{ fontWeight: 600, fontSize: '1.05rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveItinerary}
                  >
                    <Save size={15} />
                    <span>Save Itinerary</span>
                  </button>
                </div>
              </div>

              {/* Stop Rows */}
              <div className="stops-builder-list">
                {stops.map((stop, index) => {
                  const ap = getAirportByCode(stop.airportCode);
                  const isFirst = index === 0;
                  const isLast = index === stops.length - 1;

                  return (
                    <div key={stop.id} className="stop-builder-row">
                      <div className="stop-index-indicator">
                        <span className="stop-badge-num">{index + 1}</span>
                      </div>

                      <div className="stop-inputs-grid">
                        {/* Airport Select */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                            {isFirst ? 'Starting Origin' : isLast ? 'Final Destination' : `Stop #${index + 1}`}
                          </label>
                          <select
                            className="form-select"
                            value={stop.airportCode}
                            onChange={(e) => handleAirportChange(index, e.target.value)}
                          >
                            <optgroup label="India (Domestic)">
                              {AIRPORTS.filter((a) => a.isDomestic).map((a) => (
                                <option key={a.code} value={a.code}>
                                  {a.city} ({a.code}) - {a.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="International Destinations">
                              {AIRPORTS.filter((a) => !a.isDomestic).map((a) => (
                                <option key={a.code} value={a.code}>
                                  {a.city}, {a.country} ({a.code})
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {/* Date Input */}
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>
                            <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            Departure Date
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={stop.date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Action buttons: Move up/down, delete */}
                      <div className="stop-controls">
                        <button
                          type="button"
                          className="btn-icon-subtle"
                          disabled={isFirst}
                          onClick={() => handleMoveUp(index)}
                          title="Move stop earlier"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-subtle"
                          disabled={isLast}
                          onClick={() => handleMoveDown(index)}
                          title="Move stop later"
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-subtle btn-icon-danger"
                          disabled={stops.length <= 2}
                          onClick={() => handleRemoveStop(index)}
                          title="Remove stop"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Stop Button */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddStop}
                >
                  <Plus size={16} />
                  <span>Add Another Stop</span>
                </button>
              </div>
            </div>

            {/* Saved Itineraries Accordion */}
            {savedList.length > 0 && (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <FolderOpen size={18} color="var(--color-primary)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-navy)' }}>
                    Saved Multi-City Itineraries ({savedList.length})
                  </h3>
                </div>
                <div className="saved-plans-stack">
                  {savedList.map((item) => (
                    <div
                      key={item.id}
                      className="saved-plan-chip"
                      onClick={() => handleLoadSaved(item)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-navy)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                          {item.stops?.map((s) => s.airportCode).join(' → ')} • ₹{item.totalEstFare?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-icon-subtle btn-icon-danger"
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        title="Delete itinerary"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Timeline & Flight Legs Breakdown */}
          <div className="planner-summary-panel">
            {/* Quick Metrics Bar */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px', background: 'linear-gradient(135deg, var(--color-navy) 0%, #173b6c 100%)', color: 'white' }}>
              <span className="badge" style={{ background: 'rgba(255, 159, 67, 0.25)', color: 'var(--color-orange)', marginBottom: '8px' }}>
                Multi-City Overview
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', marginBottom: '14px' }}>
                {itineraryName || 'Custom Route'}
              </div>

              <div className="planner-metrics-grid">
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B3CDE8', textTransform: 'uppercase' }}>Total Flight Legs</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{legs.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B3CDE8', textTransform: 'uppercase' }}>Span of Journey</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{totalSpanDays} Days</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B3CDE8', textTransform: 'uppercase' }}>Est. Total Airfare</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                    ₹{totalEstFare.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Legs & Timeline */}
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-navy)' }}>
                  Flight Timeline & Leg Searches
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                  Click to search individual flight
                </span>
              </div>

              <div className="itinerary-legs-timeline">
                {legs.map((leg, idx) => {
                  const fromAp = getAirportByCode(leg.fromCode);
                  const toAp = getAirportByCode(leg.toCode);

                  return (
                    <div key={`leg-${idx}`} className="itinerary-leg-card">
                      <div className="leg-left-step">
                        <span className="leg-number-pill">Leg {leg.legIndex}</span>
                        <div className="leg-connector-line"></div>
                      </div>

                      <div className="leg-card-body">
                        <div className="leg-route-title">
                          <span className="leg-city">{fromAp?.city} ({leg.fromCode})</span>
                          <ArrowRight size={16} color="var(--color-primary)" />
                          <span className="leg-city">{toAp?.city} ({leg.toCode})</span>
                        </div>

                        <div className="leg-meta-row">
                          <span className="leg-meta-item">
                            <Calendar size={13} /> {leg.departureDate}
                          </span>
                          <span className="leg-meta-item">
                            <Clock size={13} /> {leg.estDuration}
                          </span>
                          <span className="leg-meta-item leg-fare-highlight">
                            Est. ₹{leg.estFare.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm leg-search-btn"
                            onClick={() => handleSearchLeg(leg)}
                          >
                            <Plane size={14} />
                            <span>Search Flights for Leg {leg.legIndex}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Academic Demo Disclaimer */}
              <div className="academic-notice-box" style={{ marginTop: '20px' }}>
                <AlertCircle size={15} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Academic Simulation Notice:</strong> Flight estimates, durations, and routes are calculated dynamically for project demonstration. Real bookings require airline GDS integration.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
