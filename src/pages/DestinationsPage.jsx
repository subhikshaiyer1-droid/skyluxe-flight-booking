import React, { useState, useMemo } from 'react';
import DestinationCard from '../components/DestinationCard';
import { DESTINATIONS } from '../data/destinations';
import { Compass, Sparkles, Filter, Search, SlidersHorizontal, MapPin } from 'lucide-react';

export default function DestinationsPage() {
  const [filterTag, setFilterTag] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All'); // 'All' | 'India' | 'International'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'priceAsc' | 'rating'

  // Categories
  const categoryTags = [
    'All',
    'Beach & Culture',
    'Royal Heritage',
    'Tea Plantations',
    'Snow & Adventure',
    'Lakes & Palaces',
    'Island of the Gods',
    'Garden Metropolis',
    'Iconic History',
    'Romance & Art'
  ];

  const filteredDestinations = useMemo(() => {
    let result = DESTINATIONS.filter((dest) => {
      // Region Filter
      if (regionFilter === 'India' && dest.country !== 'India') return false;
      if (regionFilter === 'International' && dest.country === 'India') return false;

      // Category Tag Filter
      const matchesTag = filterTag === 'All' || dest.tag.toLowerCase().includes(filterTag.toLowerCase());

      // Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        dest.city.toLowerCase().includes(q) ||
        dest.country.toLowerCase().includes(q) ||
        dest.airportCode.toLowerCase().includes(q) ||
        dest.description.toLowerCase().includes(q);

      return matchesTag && matchesQuery;
    });

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [regionFilter, filterTag, searchQuery, sortBy]);

  return (
    <div className="destinations-page section-pad" style={{ paddingTop: '40px' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '36px' }}>
          <span className="badge badge-primary section-badge">
            <Compass size={14} />
            <span>44+ Curated Getaways</span>
          </span>
          <h1 className="section-title">Explore Global & Indian Destinations</h1>
          <p className="section-subtitle">
            From the misty tea estates of Munnar and snow passes of Ladakh to the canals of Amsterdam and overwater villas of the Maldives.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border-subtle)',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Top row: Region Tabs + Search Input + Sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Region Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`trip-pill ${regionFilter === 'All' ? 'active' : ''}`}
                onClick={() => setRegionFilter('All')}
              >
                All ({DESTINATIONS.length})
              </button>
              <button
                type="button"
                className={`trip-pill ${regionFilter === 'India' ? 'active' : ''}`}
                onClick={() => setRegionFilter('India')}
              >
                🇮🇳 Domestic India
              </button>
              <button
                type="button"
                className={`trip-pill ${regionFilter === 'International' ? 'active' : ''}`}
                onClick={() => setRegionFilter('International')}
              >
                ✈️ International
              </button>
            </div>

            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-bg-light)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              minWidth: '240px',
              flex: 1,
              maxWidth: '360px'
            }}>
              <Search size={16} color="var(--color-primary)" />
              <input
                type="text"
                placeholder="Search city, country, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: 'var(--color-navy)',
                  width: '100%'
                }}
              />
            </div>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <SlidersHorizontal size={15} color="var(--color-text-light)" />
              <select
                className="field-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--color-bg-light)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <option value="popular">Recommended</option>
                <option value="priceAsc">Starting Fare: Low to High</option>
                <option value="rating">Top Rated (4.8+)</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px dashed var(--color-border-subtle)' }}>
            {categoryTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`trip-pill ${filterTag === tag ? 'active' : ''}`}
                onClick={() => setFilterTag(tag)}
                style={{ padding: '4px 12px', fontSize: '0.78rem' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Counter of matching destinations */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <span>
            Showing <strong>{filteredDestinations.length}</strong> travel destinations
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            Click <strong>Trip Planner</strong> on any destination to view 3-day itinerary & estimated expenses
          </span>
        </div>

        {/* Destinations Grid */}
        {filteredDestinations.length > 0 ? (
          <div className="destinations-grid">
            {filteredDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        ) : (
          <div className="empty-results-card">
            <p>No destinations found matching your selected filters.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilterTag('All');
                setRegionFilter('All');
                setSearchQuery('');
              }}
              style={{ marginTop: '12px' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
