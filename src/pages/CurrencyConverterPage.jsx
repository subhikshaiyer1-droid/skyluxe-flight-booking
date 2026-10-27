import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Sparkles,
  Plane,
  Compass,
  CheckCircle2
} from 'lucide-react';
import {
  SAMPLE_EXCHANGE_RATES_BASE_INR,
  SUPPORTED_CURRENCIES,
  convertCurrency,
  formatCurrency
} from '../utils/currency';

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('10000');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');

  const numAmount = Math.max(0, parseFloat(amount) || 0);
  const convertedValue = convertCurrency(numAmount, fromCurrency, toCurrency);

  // Unit rate: 1 From = ? To
  const unitRate = convertCurrency(1, fromCurrency, toCurrency);
  const reverseUnitRate = convertCurrency(1, toCurrency, fromCurrency);

  const fromInfo = SAMPLE_EXCHANGE_RATES_BASE_INR[fromCurrency];
  const toInfo = SAMPLE_EXCHANGE_RATES_BASE_INR[toCurrency];

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleQuickAmount = (val) => {
    setAmount(String(val));
  };

  return (
    <div className="currency-page section-pad">
      <div className="container">
        {/* Page Header */}
        <div className="page-header text-center" style={{ marginBottom: '36px' }}>
          <div className="badge badge-primary section-badge">
            <DollarSign size={14} />
            <span>Forex & Trip Finance Tool</span>
          </div>
          <h1 className="page-title">Travel Currency Converter</h1>
          <p className="page-subtitle" style={{ maxWidth: '640px', margin: '0 auto' }}>
            Accurately convert flight fares and travel expenses across 10 major global currencies with instant calculation and clear conversion cheat sheets.
          </p>
        </div>

        {/* Converter Card */}
        <div className="currency-converter-card">
          <div className="converter-form-grid">
            {/* Amount input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                Amount to Convert
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="form-input currency-big-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                />
                <span className="currency-input-badge">
                  {fromInfo.symbol}
                </span>
              </div>
            </div>

            {/* From Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                From Currency
              </label>
              <select
                className="form-select currency-select"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((code) => {
                  const item = SAMPLE_EXCHANGE_RATES_BASE_INR[code];
                  return (
                    <option key={code} value={code}>
                      {item.flag} {code} - {item.name} ({item.symbol})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Swap Button */}
            <div className="converter-swap-wrapper">
              <button
                type="button"
                className="btn-currency-swap"
                onClick={handleSwap}
                title="Swap currencies"
                aria-label="Swap from and to currencies"
              >
                <ArrowLeftRight size={18} />
              </button>
            </div>

            {/* To Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                To Currency
              </label>
              <select
                className="form-select currency-select"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((code) => {
                  const item = SAMPLE_EXCHANGE_RATES_BASE_INR[code];
                  return (
                    <option key={code} value={code}>
                      {item.flag} {code} - {item.name} ({item.symbol})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Quick Amount Presets */}
          <div className="currency-quick-amounts">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-light)' }}>
              Quick Presets:
            </span>
            {[1000, 5000, 10000, 25000, 50000, 100000].map((val) => (
              <button
                key={val}
                type="button"
                className={`quick-amount-pill ${Number(amount) === val ? 'active' : ''}`}
                onClick={() => handleQuickAmount(val)}
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Conversion Result Hero Display */}
          <div className="conversion-result-banner">
            <div className="result-subtext">
              {fromInfo.flag} {formatCurrency(numAmount, fromCurrency)} =
            </div>
            <div className="result-main-value">
              {toInfo.flag} {formatCurrency(convertedValue, toCurrency)}
            </div>
            <div className="result-rate-formula">
              <span>1 {fromCurrency} = {unitRate.toFixed(4)} {toCurrency}</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>•</span>
              <span>1 {toCurrency} = {reverseUnitRate.toFixed(4)} {fromCurrency}</span>
            </div>
          </div>

          {/* Explicit Illustrative Rates Disclaimer */}
          <div className="academic-notice-box" style={{ marginTop: '24px' }}>
            <AlertCircle size={18} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--color-navy)', display: 'block', marginBottom: '2px' }}>
                Illustrative Demo Rates Notice:
              </strong>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>
                Exchange rates presented in this application are illustrative benchmark rates designed for college project demonstrations and simulated trip cost calculations. They are not real-time forex feeds. Do not use these numbers for live financial trading or actual bank remittances.
              </p>
            </div>
          </div>
        </div>

        {/* Global Currency Conversion Cheat Sheet Table */}
        <div className="card" style={{ padding: '28px', marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy)', margin: 0 }}>
                Sample Forex Reference Table (Base: 1 {fromCurrency})
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-light)', margin: '4px 0 0' }}>
                Equivalent values of {fromCurrency} across all 10 supported travel currencies.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/search" className="btn btn-secondary btn-sm">
                <Plane size={15} />
                <span>Search Flights</span>
              </Link>
              <Link to="/trip-planner" className="btn btn-primary btn-sm">
                <Compass size={15} />
                <span>Trip Budget Planner</span>
              </Link>
            </div>
          </div>

          <div className="table-responsive">
            <table className="currency-table">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Country / Zone</th>
                  <th>Symbol</th>
                  <th>1 {fromCurrency} =</th>
                  <th>100 {fromCurrency} =</th>
                  <th>1,000 {fromCurrency} =</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_CURRENCIES.map((code) => {
                  const info = SAMPLE_EXCHANGE_RATES_BASE_INR[code];
                  const singleVal = convertCurrency(1, fromCurrency, code);
                  const hundredVal = convertCurrency(100, fromCurrency, code);
                  const thousandVal = convertCurrency(1000, fromCurrency, code);
                  const isCurrent = code === fromCurrency;

                  return (
                    <tr key={code} className={isCurrent ? 'row-highlight' : ''}>
                      <td>
                        <strong>{info.flag} {code}</strong>
                        {isCurrent && <span className="badge badge-primary" style={{ marginLeft: '6px', fontSize: '0.68rem' }}>Base</span>}
                      </td>
                      <td>{info.name}</td>
                      <td><code>{info.symbol}</code></td>
                      <td style={{ fontWeight: 600 }}>{singleVal.toFixed(2)} {code}</td>
                      <td>{hundredVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-navy)' }}>
                        {thousandVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
