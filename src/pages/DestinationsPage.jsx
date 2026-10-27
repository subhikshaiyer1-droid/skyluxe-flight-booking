import React, { useState, useMemo } from 'react';
import DestinationCard from '../components/DestinationCard';
import { DESTINATIONS, REGIONS_LIST } from '../data/destinations';
import { Compass, Sparkles, Filter, Search, SlidersHorizontal, MapPin, Globe, RotateCcw } from 'lucide-react';

export default function DestinationsPage() {
  const [regionFilter, setRegionFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All'); // 'All' | 'budget' (<15k) | 'standard' (15k-35k) | 'premium' (>35k)
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'priceAsc' | 'priceDesc' | 'rating'

  const filteredDestinations = useMemo(() => {
    let result = DESTINATIONS.filter((dest) => {
      // 1. Region Filter
      if (regionFilter !== 'All') {
        const destRegion = dest.region || (dest.country === 'India' ? 'India' : 'International');
        if (destRegion.toLowerCase() !== regionFilter.toLowerCase()) return false;
      }

      // 2. Budget Filter (based on totalBudget or priceFrom)
      if (budgetFilter === 'budget') {
        if (dest.totalBudget > 15000) return false;
      } else if (budgetFilter === 'standard') {
        if (dest.totalBudget <= 15000 || dest.totalBudget > 35000) return false;
      } else if (budgetFilter === 'premium') {
        if (dest.totalBudget <= 35000) return false;
      }

      // 3. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesCity = dest.city.toLowerCase().includes(q);
        const matchesCountry = dest.country.toLowerCase().includes(q);
        const matchesAirport = dest.airportCode.toLowerCase().includes(q);
        const matchesDesc = dest.description?.toLowerCase().includes(q);
        const matchesTag = dest.tag?.toLowerCase().includes(q);
        if (!matchesCity && !matchesCountry && !matchesAirport && !matchesDesc && !matchesTag) {
          return false;
        }
      }

      return true;
    });

    // 4. Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.priceFrom - a.priceFrom);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [regionFilter, budgetFilter, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setRegionFilter('All');
    setBudgetFilter('All');
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <div className="destinations-page section-pad" style={{ paddingTop: '40px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="badge badge-primary section-badge">
            <Compass size={14} />
            <span>{DESTINATIONS.length} Curated Global & Domestic Gateways</span>
          </span>
          <h1 className="section-title">Explore Domestic & International Destinations</h1>
          <p className="section-subtitle">
            From misty tea valleys of Munnar and snow passes of Ladakh to overwater villas in the Maldives and neon lights of Tokyo.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Top Row: 8 Continent / Region Pills */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Continent / Region
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {REGIONS_LIST.map((region) => {
                const count = region === 'All'
                  ? DESTINATIONS.length
                  : DESTINATIONS.filter((d) => (d.region || (d.country === 'India' ? 'India' : 'International')).toLowerCase() === region.toLowerCase()).length;

                return (
                  <button
                    key={region}
                    type="button"
                    className={`trip-pill ${regionFilter === region ? 'active' : ''}`}
                    onClick={() => setRegionFilter(region)}
                  >
                    <span>{region === 'India' ? '🇮🇳 India' : region}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Search Input + Budget Filter + Sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              <input
                type="text"
                className="field-input"
                placeholder="Search city, country, or airport (e.g. Goa, London, LHR)..."
                style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Budget Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Budget:</span>
              <select
                className="field-select"
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="All">All Budgets</option>
                <option value="budget">Under ₹15,000 (Pocket Friendly)</option>
                <option value="standard">₹15,000 - ₹35,000 (Standard)</option>
                <option value="premium">₹35,000+ (Luxury / Long Haul)</option>
              </select>
            </div>

            {/* Sort Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Sort by:</span>
              <select
                className="field-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              >
                <option value="popular">Recommended</option>
                <option value="priceAsc">Flight Fare: Low to High</option>
                <option value="priceDesc">Flight Fare: High to Low</option>
                <option value="rating">Top Rated (4.9+)</option>
              </select>
            </div>

            {/* Reset button if filtered */}
            {(regionFilter !== 'All' || budgetFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-navy)', fontWeight: 600 }}>
            Showing <strong>{filteredDestinations.length}</strong> of {DESTINATIONS.length} destinations
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            *Fares and budgets are illustrative estimates for project demonstration.
          </span>
        </div>

        {/* Destinations Cards Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="destinations-grid">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="empty-results-card">
            <Compass size={40} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
              No destinations match your criteria
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '18px' }}>
              Try switching to "All Regions" or clearing your budget and search filters.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
