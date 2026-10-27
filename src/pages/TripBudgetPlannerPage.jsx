import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DESTINATIONS } from '../data/destinations';
import { getSavedBudgetPlans, saveBudgetPlan, deleteBudgetPlan } from '../utils/plannerStorage';
import {
  Calculator,
  Compass,
  Plane,
  Users,
  Calendar,
  Wallet,
  Sparkles,
  Save,
  Trash2,
  ArrowRight,
  TrendingUp,
  PieChart,
  Luggage,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bed,
  Utensils,
  Car,
  Ticket,
  ShoppingBag
} from 'lucide-react';

export default function TripBudgetPlannerPage() {
  const navigate = useNavigate();

  // Selected Destination from Catalog or Custom
  const [selectedDestId, setSelectedDestId] = useState('goa');
  const [customDestinationName, setCustomDestinationName] = useState('');
  const [travellers, setTravellers] = useState(2);
  const [days, setDays] = useState(4);
  const [travelStyle, setTravelStyle] = useState('standard'); // 'budget' | 'standard' | 'premium'

  // Cost Inputs (in INR)
  const [flightCostPerPerson, setFlightCostPerPerson] = useState(3800);
  const [stayPerDay, setStayPerDay] = useState(2500);
  const [foodPerDayPerPerson, setFoodPerDayPerPerson] = useState(900);
  const [transportPerDay, setTransportPerDay] = useState(700);
  const [sightseeingTotal, setSightseeingTotal] = useState(1500);
  const [shoppingMiscTotal, setShoppingMiscTotal] = useState(2000);

  // Saved Plans list
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load saved plans on mount
  useEffect(() => {
    setSavedPlans(getSavedBudgetPlans());
    const handleUpdate = () => setSavedPlans(getSavedBudgetPlans());
    window.addEventListener('skyluxe_budget_plans_updated', handleUpdate);
    return () => window.removeEventListener('skyluxe_budget_plans_updated', handleUpdate);
  }, []);

  // When a catalog destination is selected, populate intelligent defaults
  const handleDestinationSelect = (destId) => {
    setSelectedDestId(destId);
    setActivePlanId(null);

    const dest = DESTINATIONS.find((d) => d.id === destId);
    if (dest) {
      const isDom = dest.isDomestic;
      setFlightCostPerPerson(dest.priceFrom || (isDom ? 3500 : 25000));

      const dailyAcc = isDom ? 2400 : 7000;
      const dailyFood = isDom ? 800 : 2200;
      const dailyTransit = isDom ? 600 : 1500;

      setStayPerDay(dailyAcc);
      setFoodPerDayPerPerson(dailyFood);
      setTransportPerDay(dailyTransit);
      setSightseeingTotal(dest.expenses?.sightseeing || (isDom ? 1200 : 4500));
      setShoppingMiscTotal(isDom ? 2000 : 6000);
    }
  };

  // Travel style multipliers
  const styleMultiplier = useMemo(() => {
    if (travelStyle === 'budget') return 0.75;
    if (travelStyle === 'premium') return 1.85;
    return 1.0;
  }, [travelStyle]);

  // Destination metadata
  const currentDest = DESTINATIONS.find((d) => d.id === selectedDestId);
  const isDomestic = currentDest ? currentDest.isDomestic : true;
  const destinationDisplayName = currentDest ? `${currentDest.city}, ${currentDest.country}` : customDestinationName || 'Custom Destination';

  // Calculations
  const calculatedValues = useMemo(() => {
    const flightTotal = flightCostPerPerson * travellers;
    const stayTotal = Math.round(stayPerDay * days * styleMultiplier);
    const foodTotal = Math.round(foodPerDayPerPerson * travellers * days * styleMultiplier);
    const transportTotal = Math.round(transportPerDay * days * styleMultiplier);
    const sightseeing = Math.round(sightseeingTotal * travellers * (travelStyle === 'premium' ? 1.4 : 1.0));
    const shopping = Math.round(shoppingMiscTotal * (travelStyle === 'premium' ? 1.6 : travelStyle === 'budget' ? 0.6 : 1.0));

    const totalCost = flightTotal + stayTotal + foodTotal + transportTotal + sightseeing + shopping;
    const costPerPerson = Math.round(totalCost / Math.max(1, travellers));
    const dailyAverage = Math.round(totalCost / Math.max(1, days));

    // Category breakdown percentages
    const pct = (val) => Math.max(1, Math.round((val / totalCost) * 100));

    return {
      flightTotal,
      stayTotal,
      foodTotal,
      transportTotal,
      sightseeing,
      shopping,
      totalCost,
      costPerPerson,
      dailyAverage,
      percentages: {
        flights: pct(flightTotal),
        stay: pct(stayTotal),
        food: pct(foodTotal),
        transport: pct(transportTotal),
        sightseeing: pct(sightseeing),
        shopping: pct(shopping)
      }
    };
  }, [
    flightCostPerPerson,
    stayPerDay,
    foodPerDayPerPerson,
    transportPerDay,
    sightseeingTotal,
    shoppingMiscTotal,
    travellers,
    days,
    styleMultiplier,
    travelStyle
  ]);

  // Save or Update Plan
  const handleSavePlan = () => {
    const plan = {
      id: activePlanId || `PLAN-${Date.now()}`,
      destinationId: selectedDestId,
      destinationName: destinationDisplayName,
      isDomestic,
      airportCode: currentDest?.airportCode || 'BOM',
      travellers,
      days,
      travelStyle,
      flightCostPerPerson,
      stayPerDay,
      foodPerDayPerPerson,
      transportPerDay,
      sightseeingTotal,
      shoppingMiscTotal,
      totalCost: calculatedValues.totalCost,
      costPerPerson: calculatedValues.costPerPerson,
      dailyAverage: calculatedValues.dailyAverage
    };

    saveBudgetPlan(plan);
    setActivePlanId(plan.id);
    setSaveSuccessMsg('Trip budget plan saved to your browser!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Load a saved plan into editor
  const handleLoadPlan = (plan) => {
    setActivePlanId(plan.id);
    setSelectedDestId(plan.destinationId || 'goa');
    setTravellers(plan.travellers || 2);
    setDays(plan.days || 4);
    setTravelStyle(plan.travelStyle || 'standard');
    setFlightCostPerPerson(plan.flightCostPerPerson || 3800);
    setStayPerDay(plan.stayPerDay || 2500);
    setFoodPerDayPerPerson(plan.foodPerDayPerPerson || 900);
    setTransportPerDay(plan.transportPerDay || 700);
    setSightseeingTotal(plan.sightseeingTotal || 1500);
    setShoppingMiscTotal(plan.shoppingMiscTotal || 2000);
  };

  const handleDeletePlan = (planId, e) => {
    e.stopPropagation();
    deleteBudgetPlan(planId);
    if (activePlanId === planId) {
      setActivePlanId(null);
    }
  };

  const handleSearchFlights = () => {
    const toAirport = currentDest?.airportCode || 'GOI';
    const params = new URLSearchParams({
      from: 'BOM',
      to: toAirport,
      tripType: 'roundTrip',
      passengers: String(travellers),
      cabinClass: travelStyle === 'premium' ? 'Business' : 'Economy'
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="budget-planner-page section-pad" style={{ paddingTop: '36px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-primary">
              <Calculator size={13} />
              <span>Smart Travel Budget Planner</span>
            </span>
            <span className="badge" style={{ background: '#FEF3C7', color: '#B45309' }}>
              Academic Estimation Tool
            </span>
          </div>
          <h1 style={{ fontSize: '2.3rem', color: 'var(--color-navy)', margin: '0 0 8px' }}>
            Smart Trip Budget Calculator
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', maxWidth: '640px' }}>
            Plan, calculate, and save full travel estimates for flights, accommodation, food, and activities with interactive expense breakdowns.
          </p>
        </div>

        {/* 2-Column Grid: Inputs Left, Live Summary Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '32px', alignItems: 'start' }}>
          {/* LEFT: Inputs Form */}
          <div style={{ background: 'white', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="var(--color-primary)" />
              <span>1. Trip Parameters & Destination</span>
            </h2>

            {/* Destination Selector */}
            <div className="search-field" style={{ marginBottom: '16px' }}>
              <label htmlFor="planner-dest" className="field-label">
                <span>Select Destination from Catalogue</span>
              </label>
              <div className="field-input-box">
                <select
                  id="planner-dest"
                  className="field-select"
                  value={selectedDestId}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                >
                  <optgroup label="── 🇮🇳 Domestic India ──">
                    {DESTINATIONS.filter((d) => d.isDomestic).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city}, {d.country} ({d.airportCode}) - From ₹{d.priceFrom.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="── 🌐 International Destinations ──">
                    {DESTINATIONS.filter((d) => !d.isDomestic).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city}, {d.country} ({d.airportCode}) - From ₹{d.priceFrom.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Travellers & Days */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="search-field">
                <label htmlFor="p-travellers" className="field-label">
                  <Users size={14} className="field-icon" />
                  <span>Number of Travellers</span>
                </label>
                <div className="field-input-box">
                  <select
                    id="p-travellers"
                    className="field-select"
                    value={travellers}
                    onChange={(e) => setTravellers(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                      <option key={num} value={num}>{num} Traveller{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-field">
                <label htmlFor="p-days" className="field-label">
                  <Calendar size={14} className="field-icon" />
                  <span>Trip Duration (Days)</span>
                </label>
                <div className="field-input-box">
                  <select
                    id="p-days"
                    className="field-select"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  >
                    {[2, 3, 4, 5, 6, 7, 10, 14, 21, 30].map((num) => (
                      <option key={num} value={num}>{num} Days ({num - 1} Nights)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Travel Style Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label className="field-label" style={{ marginBottom: '8px' }}>
                <span>Travel Style (Adjusts standards & comfort)</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'budget', label: '🎒 Budget', desc: 'Hostels & street eats' },
                  { key: 'standard', label: '🏨 Standard', desc: '3-4★ hotels & bistros' },
                  { key: 'premium', label: '✨ Premium', desc: '5★ resorts & fine dining' }
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setTravelStyle(st.key)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: travelStyle === st.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: travelStyle === st.key ? 'var(--color-primary-light)' : 'white',
                      color: travelStyle === st.key ? 'var(--color-primary)' : 'var(--color-navy)',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{st.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Expense Breakdown Categories */}
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={18} color="var(--color-orange)" />
              <span>2. Detailed Category Budgets (in INR ₹)</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Flights */}
              <div className="search-field">
                <label className="field-label">
                  <Plane size={14} className="field-icon" />
                  <span>Flight Fare (Per Person)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="500"
                    step="500"
                    value={flightCostPerPerson}
                    onChange={(e) => setFlightCostPerPerson(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Stay */}
              <div className="search-field">
                <label className="field-label">
                  <Bed size={14} className="field-icon" />
                  <span>Stay (Per Day)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="500"
                    step="200"
                    value={stayPerDay}
                    onChange={(e) => setStayPerDay(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Food */}
              <div className="search-field">
                <label className="field-label">
                  <Utensils size={14} className="field-icon" />
                  <span>Food (Per Person / Day)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="200"
                    step="100"
                    value={foodPerDayPerPerson}
                    onChange={(e) => setFoodPerDayPerPerson(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Local Transport */}
              <div className="search-field">
                <label className="field-label">
                  <Car size={14} className="field-icon" />
                  <span>Transit & Cabs (Per Day)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="100"
                    step="100"
                    value={transportPerDay}
                    onChange={(e) => setTransportPerDay(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Sightseeing */}
              <div className="search-field">
                <label className="field-label">
                  <Ticket size={14} className="field-icon" />
                  <span>Sights & Tickets (Per Person)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="0"
                    step="200"
                    value={sightseeingTotal}
                    onChange={(e) => setSightseeingTotal(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Shopping & Misc */}
              <div className="search-field">
                <label className="field-label">
                  <ShoppingBag size={14} className="field-icon" />
                  <span>Shopping & Misc (Total)</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="number"
                    className="field-input"
                    min="0"
                    step="500"
                    value={shoppingMiscTotal}
                    onChange={(e) => setShoppingMiscTotal(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSavePlan}
                style={{ flex: 1 }}
              >
                <Save size={16} />
                <span>{activePlanId ? 'Update Saved Trip Plan' : 'Save Trip Plan to Browser'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSearchFlights}
              >
                <Plane size={16} />
                <span>Search Flights</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                ✓ {saveSuccessMsg}
              </div>
            )}
          </div>

          {/* RIGHT: Live Calculated Summary Card & Saved Plans */}
          <div>
            {/* Grand Total Card */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-navy) 0%, #153A68 100%)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge" style={{ background: 'rgba(255, 159, 67, 0.25)', color: 'var(--color-orange)' }}>
                  {isDomestic ? '🇮🇳 Domestic Trip Estimate' : '🌐 International Trip Estimate'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#C5DCF5' }}>
                  {travellers} Travellers • {days} Days
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'white', margin: '0 0 16px' }}>
                {destinationDisplayName}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-orange)' }}>
                  ₹{calculatedValues.totalCost.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#C5DCF5' }}>Total Estimated Cost</span>
              </div>

              {/* Per person & daily metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#B3CEEE' }}>Per Person Cost</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                    ₹{calculatedValues.costPerPerson.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#B3CEEE' }}>Daily Group Avg</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                    ₹{calculatedValues.dailyAverage.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={17} color="var(--color-primary)" />
                <span>Expense Breakdown by Category</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: '✈️ Flights & Transit', amount: calculatedValues.flightTotal, pct: calculatedValues.percentages.flights, color: '#2563EB' },
                  { label: '🏨 Hotel & Accommodation', amount: calculatedValues.stayTotal, pct: calculatedValues.percentages.stay, color: '#7C3AED' },
                  { label: '🍽️ Food & Dining', amount: calculatedValues.foodTotal, pct: calculatedValues.percentages.food, color: '#D97706' },
                  { label: '🚕 Local Transport & Cabs', amount: calculatedValues.transportTotal, pct: calculatedValues.percentages.transport, color: '#059669' },
                  { label: '🎟️ Sightseeing & Activities', amount: calculatedValues.sightseeing, pct: calculatedValues.percentages.sightseeing, color: '#DC2626' },
                  { label: '🛍️ Shopping & Souvenirs', amount: calculatedValues.shopping, pct: calculatedValues.percentages.shopping, color: '#DB2777' }
                ].map((cat) => (
                  <div key={cat.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{cat.label}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>
                        ₹{cat.amount.toLocaleString('en-IN')} ({cat.pct}%)
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.pct}%`, height: '100%', background: cat.color, borderRadius: 'var(--radius-pill)' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', padding: '10px 12px', background: 'var(--color-bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                *All amounts are simulated estimates for academic viva and project demonstrations.
              </div>
            </div>

            {/* Saved Plans List in LocalStorage */}
            {savedPlans.length > 0 && (
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bookmark size={17} color="var(--color-primary)" />
                  <span>Saved Trip Plans ({savedPlans.length})</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleLoadPlan(plan)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: activePlanId === plan.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border-subtle)',
                        background: activePlanId === plan.id ? 'var(--color-primary-light)' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-navy)' }}>
                          {plan.destinationName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {plan.travellers} Travellers • {plan.days} Days • Total: ₹{plan.totalCost?.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete saved plan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
