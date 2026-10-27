// Shared Fare Calculation Utility for SkyLuxe
// Ensures 100% consistent fare calculations across Search, FlightCard, CompareModal, Booking, Confirmation, and My Bookings.

export const AVAILABLE_COUPONS = [
  {
    code: 'SKY10',
    discountPercent: 10,
    maxDiscount: 2000,
    minFare: 0,
    description: '10% Base Fare Discount (Up to ₹2,000)',
    internationalOnly: false
  },
  {
    code: 'FIRST500',
    flatDiscount: 500,
    minFare: 3000,
    description: 'Flat ₹500 Off (Min. Base Fare ₹3,000)',
    internationalOnly: false
  },
  {
    code: 'STUDENT20',
    discountPercent: 20,
    maxDiscount: 3500,
    minFare: 2500,
    description: '20% Student Special (Up to ₹3,500)',
    internationalOnly: false
  },
  {
    code: 'GLOBAL15',
    discountPercent: 15,
    maxDiscount: 6000,
    minFare: 12000,
    description: '15% Off International Flights (Min. ₹12,000 Base)',
    internationalOnly: true
  }
];

// Computes seat upgrade fees from selected seat strings (e.g., "1A", "12F")
export const calculateSeatFees = (selectedSeats = []) => {
  if (!Array.isArray(selectedSeats)) return 0;
  let totalSeatFee = 0;

  selectedSeats.forEach((seatId) => {
    if (!seatId || typeof seatId !== 'string') return;
    const cleanSeat = seatId.toUpperCase().trim();
    const row = parseInt(cleanSeat.slice(0, -1), 10);
    const col = cleanSeat.slice(-1);

    if (row === 1) {
      totalSeatFee += 450; // Front Row Extra Legroom
    } else if (row >= 2 && row <= 4) {
      totalSeatFee += 250; // Forward Cabin
    } else if (col === 'A' || col === 'F') {
      totalSeatFee += 150; // Window Seat
    } else if (col === 'C' || col === 'D') {
      totalSeatFee += 100; // Aisle Seat
    }
    // Middle seats (B, E) are complimentary ₹0
  });

  return totalSeatFee;
};

// Validate and compute coupon discount
export const calculateCouponDiscount = (couponCode, baseFareTotal, isDomestic = true) => {
  if (!couponCode) return { valid: false, discount: 0, message: '' };

  const code = couponCode.toUpperCase().trim();
  const matched = AVAILABLE_COUPONS.find((c) => c.code === code);

  if (!matched) {
    return {
      valid: false,
      discount: 0,
      message: 'Invalid coupon code. Try SKY10, FIRST500, STUDENT20, or GLOBAL15.'
    };
  }

  if (matched.internationalOnly && isDomestic) {
    return {
      valid: false,
      discount: 0,
      message: `${code} is valid only on International flight bookings.`
    };
  }

  if (baseFareTotal < matched.minFare) {
    return {
      valid: false,
      discount: 0,
      message: `${code} requires a minimum base fare of ₹${matched.minFare.toLocaleString('en-IN')}.`
    };
  }

  let discount = 0;
  if (matched.flatDiscount) {
    discount = matched.flatDiscount;
  } else if (matched.discountPercent) {
    discount = Math.round((baseFareTotal * matched.discountPercent) / 100);
    if (matched.maxDiscount) {
      discount = Math.min(discount, matched.maxDiscount);
    }
  }

  return {
    valid: true,
    code: matched.code,
    discount,
    description: matched.description,
    message: `Coupon ${matched.code} applied! Saved ₹${discount.toLocaleString('en-IN')}`
  };
};

// Unified fare calculator function
export const calculateFlightFare = ({
  flight,
  passengerCount = 1,
  selectedSeats = [],
  couponCode = null,
  tripType = 'oneWay'
}) => {
  const pCount = Math.max(1, Number(passengerCount) || 1);
  const isRoundTrip = tripType === 'roundTrip';
  const unitPrice = flight?.price || 4000;
  const isDomestic = flight?.isDomestic ?? true;

  // Round trip gets a 5% discount on the return leg factor (1.9x instead of 2.0x)
  const tripMultiplier = isRoundTrip ? 1.9 : 1.0;

  const baseFareTotal = Math.round(unitPrice * pCount * tripMultiplier);
  const taxesAndFees = Math.round(baseFareTotal * 0.12); // 12% airport tax & GST
  const userDevFee = 350 * pCount * (isRoundTrip ? 2 : 1); // Airport Development Fee
  const seatFeeTotal = calculateSeatFees(selectedSeats);

  const couponResult = calculateCouponDiscount(couponCode, baseFareTotal, isDomestic);
  const couponDiscountAmount = couponResult.valid ? couponResult.discount : 0;

  const totalPrice = Math.max(
    0,
    baseFareTotal + taxesAndFees + userDevFee + seatFeeTotal - couponDiscountAmount
  );

  // Cancellation estimation (Simulated)
  const cancellationFee = flight?.refundable
    ? (flight?.changeFee || 1500) * pCount
    : Math.round(totalPrice * 0.4);
  const estimatedRefund = Math.max(0, totalPrice - cancellationFee);

  return {
    baseFarePerPassenger: unitPrice,
    passengerCount: pCount,
    isRoundTrip,
    isDomestic,
    baseFareTotal,
    taxesAndFees,
    userDevFee,
    seatFeeTotal,
    appliedCoupon: couponResult.valid
      ? {
          code: couponResult.code,
          discount: couponDiscountAmount,
          description: couponResult.description
        }
      : null,
    couponDiscountAmount,
    totalPrice,
    cancellationFee,
    estimatedRefund
  };
};
