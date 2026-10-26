import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Plane,
  Save,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Compass
} from 'lucide-react';
import { AIRLINES } from '../data/flights';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredSeat: 'Window',
    frequentFlyerAirline: 'IndiGo',
    idType: 'Aadhaar / National ID'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('skyluxe_traveller_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setProfile((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (err) {
      console.warn('Error reading traveller profile:', err);
    }
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('skyluxe_traveller_profile', JSON.stringify(profile));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.warn('Error saving traveller profile:', err);
    }
  };

  const handleClearProfile = () => {
    try {
      localStorage.removeItem('skyluxe_traveller_profile');
      setProfile({
        fullName: '',
        email: '',
        phone: '',
        preferredSeat: 'Window',
        frequentFlyerAirline: 'IndiGo',
        idType: 'Aadhaar / National ID'
      });
      setSavedSuccess(false);
    } catch (err) {
      console.warn('Error clearing traveller profile:', err);
    }
  };

  return (
    <div className="section-pad" style={{ paddingTop: '40px' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="badge badge-primary section-badge">
            <User size={14} />
            <span>Local Browser Storage</span>
          </span>
          <h1 className="section-title">Traveller Profile</h1>
          <p className="section-subtitle">
            Save your personal contact details and travel preferences locally in your browser. SkyLuxe will offer to pre-fill your details during flight bookings in one click.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '36px' }}>
          {savedSuccess && (
            <div style={{
              background: 'var(--color-success-bg)',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#065F46',
              fontSize: '0.9rem'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>Profile details saved successfully! You can now use 1-click auto-fill on the booking page.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="passenger-fields-grid" style={{ marginBottom: '24px' }}>
              {/* Full Name */}
              <div className="search-field" style={{ gridColumn: 'span 2' }}>
                <label className="field-label">
                  <User size={15} className="field-icon" />
                  <span>Full Legal Name</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Subhiksha Sharma"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="search-field">
                <label className="field-label">
                  <Mail size={15} className="field-icon" />
                  <span>Email Address</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="email"
                    className="field-input"
                    placeholder="e.g. subhiksha@example.com"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="search-field">
                <label className="field-label">
                  <Phone size={15} className="field-icon" />
                  <span>Phone Number</span>
                </label>
                <div className="field-input-box">
                  <input
                    type="tel"
                    className="field-input"
                    placeholder="e.g. +91 98765 43210"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Preferred Seat */}
              <div className="search-field">
                <label className="field-label">
                  <Plane size={15} className="field-icon" />
                  <span>Seat Preference</span>
                </label>
                <div className="field-input-box">
                  <select
                    className="field-select"
                    value={profile.preferredSeat}
                    onChange={(e) => setProfile({ ...profile, preferredSeat: e.target.value })}
                  >
                    <option value="Window">Window Seat</option>
                    <option value="Aisle">Aisle Seat</option>
                    <option value="Extra Legroom">Extra Legroom</option>
                  </select>
                </div>
              </div>

              {/* Frequent Flyer Airline */}
              <div className="search-field">
                <label className="field-label">
                  <Plane size={15} className="field-icon" />
                  <span>Preferred Airline</span>
                </label>
                <div className="field-input-box">
                  <select
                    className="field-select"
                    value={profile.frequentFlyerAirline}
                    onChange={(e) => setProfile({ ...profile, frequentFlyerAirline: e.target.value })}
                  >
                    {AIRLINES.map((a) => (
                      <option key={a.code} value={a.name}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="demo-notice-alert" style={{ marginBottom: '28px' }}>
              <ShieldCheck size={20} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <strong>Local Device Privacy:</strong> Your traveller profile is saved strictly on your local browser using HTML5 LocalStorage. No server, database, or external tracker has access to your entered details.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary btn-lg">
                <Save size={18} />
                <span>Save Traveller Profile</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearProfile}
                title="Clear saved data from browser"
              >
                <Trash2 size={16} color="#EF4444" />
                <span style={{ color: '#EF4444' }}>Clear Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
