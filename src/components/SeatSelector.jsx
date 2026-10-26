import React from 'react';
import { Plane, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function SeatSelector({
  passengerCount = 1,
  selectedSeats = [],
  onSeatChange,
  airline = 'SkyLuxe Airline'
}) {
  // Predefined occupied seats simulation (deterministic)
  const OCCUPIED_SEATS = ['1A', '2B', '3F', '4C', '5D', '6E', '7A', '8F'];

  // Seat pricing logic
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
      fee = 0;
    }

    return { type, fee };
  };

  const handleSeatClick = (seatId) => {
    if (OCCUPIED_SEATS.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      // Deselect
      const updated = selectedSeats.filter((s) => s !== seatId);
      onSeatChange(updated);
    } else {
      if (selectedSeats.length >= passengerCount) {
        // If already selected max seats, replace the earliest selected one or alert
        const updated = [...selectedSeats.slice(1), seatId];
        onSeatChange(updated);
      } else {
        onSeatChange([...selectedSeats, seatId]);
      }
    }
  };

  // Calculate total seat fee
  const totalSeatFee = selectedSeats.reduce((sum, seatId) => {
    return sum + getSeatInfo(seatId).fee;
  }, 0);

  const rows = [1, 2, 3, 4, 5, 6, 7, 8];
  const leftCols = ['A', 'B', 'C'];
  const rightCols = ['D', 'E', 'F'];

  return (
    <div className="seat-selector-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plane size={18} color="var(--color-primary)" />
            <span>Select Your Preferred Seats</span>
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Choose {passengerCount} {passengerCount > 1 ? 'seats' : 'seat'} for your party. Selected: <strong>{selectedSeats.length}/{passengerCount}</strong>
          </p>
        </div>

        {selectedSeats.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>Seat Upgrade Total</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              + ₹{totalSeatFee.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>

      {/* Seat Legend */}
      <div className="seat-legend-bar">
        <div className="seat-legend-item">
          <div className="seat-cell seat-available-demo"></div>
          <span>Available (Free)</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-cell seat-premium-demo"></div>
          <span>Window/Legroom (+₹)</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-cell seat-selected-demo"></div>
          <span>Selected</span>
        </div>
        <div className="seat-legend-item">
          <div className="seat-cell seat-occupied-demo"></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Airplane Cabin Layout */}
      <div className="airplane-cabin-wrap">
        <div className="airplane-nose">
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: 600 }}>COCKPIT</span>
        </div>

        <div className="airplane-seats-grid">
          {rows.map((rowNum) => (
            <div key={`row-${rowNum}`} className="seat-row">
              {/* Left Column Seats A B C */}
              <div className="seat-group">
                {leftCols.map((col) => {
                  const seatId = `${rowNum}${col}`;
                  const isOccupied = OCCUPIED_SEATS.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  const { type, fee } = getSeatInfo(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleSeatClick(seatId)}
                      className={`seat-button ${
                        isSelected
                          ? 'seat-selected'
                          : isOccupied
                          ? 'seat-occupied'
                          : fee > 0
                          ? 'seat-premium'
                          : 'seat-available'
                      }`}
                      title={`${seatId} - ${type} ${fee > 0 ? `(+₹${fee})` : '(Free)'}`}
                    >
                      <span className="seat-label">{seatId}</span>
                    </button>
                  );
                })}
              </div>

              {/* Aisle Row Number */}
              <div className="seat-aisle-marker">
                <span>{rowNum}</span>
              </div>

              {/* Right Column Seats D E F */}
              <div className="seat-group">
                {rightCols.map((col) => {
                  const seatId = `${rowNum}${col}`;
                  const isOccupied = OCCUPIED_SEATS.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  const { type, fee } = getSeatInfo(seatId);

                  return (
                    <button
                      key={seatId}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => handleSeatClick(seatId)}
                      className={`seat-button ${
                        isSelected
                          ? 'seat-selected'
                          : isOccupied
                          ? 'seat-occupied'
                          : fee > 0
                          ? 'seat-premium'
                          : 'seat-available'
                      }`}
                      title={`${seatId} - ${type} ${fee > 0 ? `(+₹${fee})` : '(Free)'}`}
                    >
                      <span className="seat-label">{seatId}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Seats Badges */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-navy)', fontWeight: 600 }}>
            Assigned Seats:
          </span>
          {selectedSeats.length > 0 ? (
            selectedSeats.map((seatId) => {
              const { type, fee } = getSeatInfo(seatId);
              return (
                <span key={seatId} className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                  {seatId} ({type} {fee > 0 ? `+₹${fee}` : 'Free'})
                </span>
              );
            })
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
              None selected (Standard complimentary seat will be automatically assigned)
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
          *Simulated interactive seat layout
        </span>
      </div>
    </div>
  );
}
