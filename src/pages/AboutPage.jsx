import React, { useState } from 'react';
import {
  Info,
  Code2,
  Layers,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Palette,
  Database,
  Heart,
  Calendar,
  Clock,
  User,
  Tag
} from 'lucide-react';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      question: '1. What is the core objective of the SkyLuxe project?',
      answer:
        'SkyLuxe is a full-featured, responsive flight booking web application developed as an academic college project. Its primary goal is to simulate realistic airline flight search, filtering, comparison, seat selection, coupon discounts, passenger detail entry, fare calculation, boarding pass generation, and flight tracking with a modern and accessible user interface.'
    },
    {
      question: '2. Which technologies and libraries are used in this project?',
      answer:
        'The frontend is built with React 19/18 and Vite for fast development and build tooling. React Router is utilized for client-side multi-page navigation. Styling uses modern Vanilla CSS with CSS custom properties (variables) for consistent theming. Icons are rendered using Lucide React, and celebration animations utilize Canvas Confetti.'
    },
    {
      question: '3. How does the flight search and dynamic generation algorithm work?',
      answer:
        'When the user submits an origin, destination, and cabin class, the search engine looks up the airports and computes realistic flight durations, departure schedules, stops (non-stop vs 1-stop), and pricing based on distance brackets (Domestic, Gulf, South-East Asia, Far East, European, Long-haul). This guarantees that all 44+ domestic and international airport pairs yield realistic flight schedules without requiring a paid live airline API.'
    },
    {
      question: '4. How does the smart flight comparison and flexible date calendar work?',
      answer:
        'The flexible date engine computes estimated daily fares across a 7-day range centered on the chosen departure date and automatically badges the lowest one. For comparison, users can select up to 3 flights to display in a side-by-side modal highlighting the lowest fare, fastest duration, baggage rules, and amenities.'
    },
    {
      question: '5. How are interactive seat selection and promo coupons calculated?',
      answer:
        'The seat map represents an airplane cabin across 8 rows where window, aisle, and extra-legroom seats have clearly marked fees. The coupon validator checks codes such as SKY10 (10% off), FIRST500 (₹500 off), and STUDENT20 (20% off), deducting the discount from the base fare and ensuring the exact same final amount carries through confirmation and My Bookings.'
    },
    {
      question: '6. How is data persistence handled without a backend database?',
      answer:
        'Demo bookings, saved wishlists (destinations & flights), and traveller profile details are persisted in the browser’s LocalStorage under keys `skyluxe_bookings`, `skyluxe_saved_destinations`, `skyluxe_saved_flights`, and `skyluxe_traveller_profile`. Custom DOM events (`skyluxe_booking_updated` & `skyluxe_saved_updated`) synchronize navigation badges in real time.'
    },
    {
      question: '7. What validation rules are implemented across forms?',
      answer:
        'The search form checks that: (a) origin and destination are selected, (b) origin and destination cannot be identical, (c) departure date cannot be in the past, and (d) return date cannot be prior to departure date. The booking form validates passenger name length, email format using regex, and phone number digits.'
    }
  ];

  return (
    <div className="about-page">
      <div className="container">
        {/* Header Section */}
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="badge badge-primary section-badge">
            <Info size={14} />
            <span>Academic Project Showcase</span>
          </span>
          <h1 className="section-title">About SkyLuxe</h1>
          <p className="section-subtitle">
            “Your journey, made simple.” — A clean, interactive flight booking simulation engineered for seamless demonstration and student project defense.
          </p>
        </div>

        {/* Project Introduction Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.45rem', color: 'var(--color-navy)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--color-orange)" />
            <span>Project Overview</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '16px' }}>
            SkyLuxe demonstrates modern frontend software engineering principles. While commercial flight portals often overwhelm users with clutter, aggressive upselling, and complex booking funnels, SkyLuxe prioritizes simplicity, aesthetic clarity, and honest interaction.
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', lineHeight: '1.7', margin: 0 }}>
            Every interaction on this site—from smart flight comparison, flexible date calendars, and 44+ destination trip planners to interactive seat selection, promo coupons, flight tracking, and printable boarding passes—is designed to be easily explained during viva examinations and project presentations.
          </p>
        </div>

        {/* Key Features Highlights */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
            Interactive Features Built-In
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Engineered with modern frontend components and zero external backend dependencies.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Layers size={24} />
              </div>
              <h3 className="feature-title">Smart Flight Comparison</h3>
              <p className="feature-desc">Select up to 3 flights to compare price, duration, stops, baggage, and amenities side-by-side.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                <Calendar size={24} />
              </div>
              <h3 className="feature-title">Flexible Date Fare Calendar</h3>
              <p className="feature-desc">7-day price comparison strip highlighting the lowest estimated fare with instant date switching.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                <Heart size={24} />
              </div>
              <h3 className="feature-title">Wishlist & Saved Items</h3>
              <p className="feature-desc">Bookmark favourite destinations and flights stored locally in browser LocalStorage.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Compass size={24} />
              </div>
              <h3 className="feature-title">44+ Destination Trip Planners</h3>
              <p className="feature-desc">Curated 3-day itineraries, top attractions, and estimated trip budgets across India and the globe.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
                <Plane size={24} />
              </div>
              <h3 className="feature-title">Interactive Seat Map</h3>
              <p className="feature-desc">Choose Window, Aisle, or Extra-Legroom seats with live pricing and visual airplane cabin layout.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
                <Clock size={24} />
              </div>
              <h3 className="feature-title">Flight Status Tracker</h3>
              <p className="feature-desc">Track live simulated stages (Scheduled, Boarding, Departed, In Air, Arrived) by PNR reference.</p>
            </div>
          </div>
        </div>

        {/* Technologies Used Grid */}
        <div style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)', marginBottom: '8px' }}>
            Technologies & Tools
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Built using standard, industry-recognized modern web development tools.
          </p>

          <div className="tech-stack-grid">
            <div className="tech-card">
              <div className="tech-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <Code2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '6px' }}>React + Vite</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                High-performance component architecture with instant HMR and clean state hooks.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '6px' }}>React Router</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Declarative client-side routing between Home, Flights, Wishlist, Status, and Bookings.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Palette size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '6px' }}>Vanilla CSS3</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Custom properties design system with curated colors, shadows, and responsive media queries.
              </p>
            </div>

            <div className="tech-card">
              <div className="tech-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                <Database size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy)', marginBottom: '6px' }}>LocalStorage API</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Persistent client-side storage for bookings, wishlists, and user traveller profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Viva / Presentation Q&A Accordion */}
        <div id="viva" style={{ marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Award size={24} color="var(--color-orange)" />
            <h2 style={{ fontSize: '1.6rem', color: 'var(--color-navy)', margin: 0 }}>
              College Viva & Presentation Defense Guide
            </h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Click each question to review the conceptual answers to explain to project evaluators.
          </p>

          <div className="viva-faq-accordion">
            {vivaQuestions.map((item, index) => (
              <div key={index} className="viva-faq-item">
                <button
                  type="button"
                  className="viva-faq-q"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{item.question}</span>
                  {openFaq === index ? <ChevronUp size={18} color="var(--color-primary)" /> : <ChevronDown size={18} />}
                </button>
                {openFaq === index && (
                  <div className="viva-faq-a">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Student Note Banner */}
        <div style={{
          background: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 32px',
          border: '1px solid #C9DEFA',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--color-navy)', fontSize: '1.15rem', marginBottom: '4px' }}>
              Academic Presentation Note
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-navy-light)', lineHeight: '1.5' }}>
              You can run this project locally using <code>npm run dev</code>. The code structure is organized into <code>components</code>, <code>pages</code>, <code>data</code>, and <code>styles</code> with descriptive naming conventions for ease of code explanation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
