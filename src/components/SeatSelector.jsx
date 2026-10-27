import React from 'react';
import { Plane } from 'lucide-react';

export default function SeatSelector({
  passengerCount = 1,
  selectedSeats = [],
  onChange,
  onSeatChange,
  airline = 'SkyLuxe Airline',
}) {
  // Keep compatibility with both prop names.
  // BookingPage.jsx currently passes onChange={setSelectedSeats}.
  const updateSeats = onChange || onSeatChange;

  const safeSelectedSeats = Array.isArray(selectedSeats)
    ? selectedSeats
    : [];

  const maxSeats = Math.max(1, Number(passengerCount) || 1);

  // Simulated occupied seats for this demo.
  const OCCUPIED_SEATS = [
    '1A', '2B', '3F', '4C',
    '5D', '6E', '7A', '8F',
  ];

  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const leftCols = ['A', 'B', 'C'];
  const rightCols = ['D', 'E', 'F'];

  const getSeatInfo = (seatId) => {
    const row = parseInt(seatId.slice(0, -1), 10);
    const col = seatId.slice(-1);

    const isExtraLegroom = row === 1;
    const isWindow = col === 'A' || col === 'F';
    const isAisle = col === 'C' || col === 'D';

    let type = 'Standard';
    let fee = 0;

    if (isExtraLegroom) {
      type = 'Extra Legroom';
      fee = 350;
    } else if (isWindow) {
      type = 'Window';
      fee = 150;
    } else if (isAisle) {
      type = 'Aisle';
      fee = 120;
    } else {
      type = 'Middle (Free)';
    }

    return { type, fee };
  };

  const handleSeatClick = (seatId) => {
    if (OCCUPIED_SEATS.includes(seatId)) return;

    if (typeof updateSeats !== 'function') {
      console.error(
        'SeatSelector requires onChange or onSeatChange callback.'
      );
      return;
    }

    let updatedSeats;

    if (safeSelectedSeats.includes(seatId)) {
      // Clicking a selected seat deselects it.
      updatedSeats = safeSelectedSeats.filter(
        (seat) => seat !== seatId
      );
    } else if (safeSelectedSeats.length < maxSeats) {
      // Add the seat if passenger capacity has not been reached.
      updatedSeats = [...safeSelectedSeats, seatId];
    } else {
      // Replace the earliest selected seat when the limit is reached.
      updatedSeats = [
        ...safeSelectedSeats.slice(1),
        seatId,
      ];
    }

    updateSeats(updatedSeats);
  };

  const totalSeatFee = safeSelectedSeats.reduce(
    (total, seatId) => total + getSeatInfo(seatId).fee,
    0
  );

  const renderSeat = (rowNum, col) => {
    const seatId = `${rowNum}${col}`;
    const isOccupied = OCCUPIED_SEATS.includes(seatId);
    const isSelected = safeSelectedSeats.includes(seatId);
    const { type, fee } = getSeatInfo(seatId);

    let seatClass = 'seat-available';

    if (isOccupied) {
      seatClass = 'seat-occupied';
    } else if (isSelected) {
      seatClass = 'seat-selected';
    } else if (fee > 0) {
      seatClass = 'seat-premium';
    }

    return (
      <button
        key={seatId}
        type="button"
        disabled={isOccupied}
        aria-pressed={isSelected}
        aria-label={`Seat ${seatId}, ${type}${fee > 0 ? `, extra charge ₹${fee}` : ', free'
          }${isOccupied ? ', occupied' : ''}`}
        onClick={() => handleSeatClick(seatId)}
        className={`seat-button ${seatClass}`}
        title={`${seatId} - ${type}${fee > 0 ? ` (+₹${fee})` : ' (Free)'
          }${isOccupied ? ' - Occupied' : ''}`}
        style={{
          cursor: isOccupied ? 'not-allowed' : 'pointer',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          opacity: isOccupied ? 0.55 : 1,
          outline: isSelected ? '2px solid #2563eb' : undefined,
          outlineOffset: isSelected ? '2px' : undefined,
        }}
      >
        <span className="seat-label">{seatId}</span>
      </button>
    );
  };

  return (
    <div className="seat-selector-card">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.2rem',
              color: 'var(--color-navy)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plane size={18} color="var(--color-primary)" />
            <span>Select Your Preferred Seats</span>
          </h3>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              margin: '4px 0 0',
            }}
          >
            Choose {maxSeats} {maxSeats > 1 ? 'seats' : 'seat'} for your
            party. Selected:{' '}
            <strong>
              {safeSelectedSeats.length}/{maxSeats}
            </strong>
          </p>
        </div>

        {safeSelectedSeats.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-light)',
              }}
            >
              Seat Upgrade Total
            </span>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--color-primary)',
              }}
            >
              + ₹{totalSeatFee.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      {/* Seat legend */}
      <div className="seat-legend-bar">
        <div className="seat-legend-item">
          <div className="seat-cell seat-available-demo" />
          <span>Available (Free)</span>
        </div>

        <div className="seat-legend-item">
          <div className="seat-cell seat-premium-demo" />
          <span>Window / Premium (+₹)</span>
        </div>

        <div className="seat-legend-item">
          <div className="seat-cell seat-selected-demo" />
          <span>Selected</span>
        </div>

        <div className="seat-legend-item">
          <div className="seat-cell seat-occupied-demo" />
          <span>Occupied</span>
        </div>
      </div>

      {/* Airplane cabin */}
      <div className="airplane-cabin-wrap">
        <div className="airplane-nose">
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-text-light)',
              fontWeight: 600,
            }}
          >
            COCKPIT
          </span>
        </div>

        <div className="airplane-seats-grid">
          {rows.map((rowNum) => (
            <div key={`row-${rowNum}`} className="seat-row">
              <div className="seat-group">
                {leftCols.map((col) => renderSeat(rowNum, col))}
              </div>

              <div className="seat-aisle-marker">
                <span>{rowNum}</span>
              </div>

              <div className="seat-group">
                {rightCols.map((col) => renderSeat(rowNum, col))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected seats */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-navy)',
              fontWeight: 600,
            }}
          >
            Assigned Seats:
          </span>

          {safeSelectedSeats.length > 0 ? (
            safeSelectedSeats.map((seatId) => {
              const { type, fee } = getSeatInfo(seatId);

              return (
                <span
                  key={seatId}
                  className="badge badge-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  {seatId} ({type}
                  {fee > 0 ? ` +₹${fee}` : ' Free'})
                </span>
              );
            })
          ) : (
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-light)',
                fontStyle: 'italic',
              }}
            >
              No seats selected. A complimentary seat will be assigned
              automatically if you continue without selecting one.
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-light)',
          }}
        >
          {airline} · Simulated seat layout
        </span>
      </div>
    </div>
  );
}
