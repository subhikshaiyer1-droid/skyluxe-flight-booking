// Flights Data, Route Engine, and Flexible Calendar Estimator for SkyLuxe
import { getAirportByCode, isDomesticRoute } from './airports';

export const AIRLINES = [
  {
    name: 'IndiGo',
    code: '6E',
    color: '#002E6E',
    bgLight: '#E8F1FC',
    logoText: '6E',
    isDomesticSpecialist: true
  },
  {
    name: 'Air India',
    code: 'AI',
    color: '#C7081B',
    bgLight: '#FDECEE',
    logoText: 'AI',
    isDomesticSpecialist: true
  },
  {
    name: 'Vistara',
    code: 'UK',
    color: '#5C1D41',
    bgLight: '#F7EDF3',
    logoText: 'UK',
    isDomesticSpecialist: true
  },
  {
    name: 'Akasa Air',
    code: 'QP',
    color: '#E05A1C',
    bgLight: '#FFF1E8',
    logoText: 'QP',
    isDomesticSpecialist: true
  },
  {
    name: 'Emirates',
    code: 'EK',
    color: '#D71921',
    bgLight: '#FCECEE',
    logoText: 'EK',
    isDomesticSpecialist: false
  },
  {
    name: 'Singapore Airlines',
    code: 'SQ',
    color: '#00266B',
    bgLight: '#EBF1FB',
    logoText: 'SQ',
    isDomesticSpecialist: false
  },
  {
    name: 'British Airways',
    code: 'BA',
    color: '#075AAA',
    bgLight: '#ECF3FB',
    logoText: 'BA',
    isDomesticSpecialist: false
  },
  {
    name: 'Qatar Airways',
    code: 'QR',
    color: '#5C0632',
    bgLight: '#F7EAF0',
    logoText: 'QR',
    isDomesticSpecialist: false
  },
  {
    name: 'Lufthansa',
    code: 'LH',
    color: '#05164D',
    bgLight: '#EDF1F8',
    logoText: 'LH',
    isDomesticSpecialist: false
  },
  {
    name: 'Etihad Airways',
    code: 'EY',
    color: '#A07D35',
    bgLight: '#FAF5EA',
    logoText: 'EY',
    isDomesticSpecialist: false
  }
];

// Helper to estimate flight duration & base price based on airports
export const estimateFlightDetails = (fromCode, toCode) => {
  const isDomestic = isDomesticRoute(fromCode, toCode);

  const fromAirport = getAirportByCode(fromCode);
  const toAirport = getAirportByCode(toCode);

  const regionTo = toAirport?.region || 'Global';
  const regionFrom = fromAirport?.region || 'Global';

  // Indian Domestic routes
  if (isDomestic) {
    // Metro to Metro e.g. BOM-DEL, BLR-DEL: ~125m, ~₹4,500
    return {
      baseMinutes: 130,
      basePrice: 4200,
      domestic: true,
      category: 'Domestic India'
    };
  }

  // South Asia neighbor (Sri Lanka, Nepal)
  if (['CMB', 'KTM'].includes(toCode) || ['CMB', 'KTM'].includes(fromCode)) {
    return {
      baseMinutes: 160,
      basePrice: 11500,
      domestic: false,
      category: 'South Asia'
    };
  }

  // Middle East / Gulf (Dubai, Abu Dhabi, Doha, Istanbul)
  if (regionTo === 'Middle East' || regionFrom === 'Middle East') {
    return {
      baseMinutes: 220,
      basePrice: 16800,
      domestic: false,
      category: 'Middle East'
    };
  }

  // Southeast Asia (Singapore, Bangkok, Phuket, Bali, KL, Maldives)
  if (['SIN', 'BKK', 'HKT', 'DPS', 'KUL', 'MLE'].includes(toCode) || ['SIN', 'BKK', 'HKT', 'DPS', 'KUL', 'MLE'].includes(fromCode)) {
    return {
      baseMinutes: 280,
      basePrice: 18500,
      domestic: false,
      category: 'Southeast Asia'
    };
  }

  // East Asia (Tokyo, Seoul, Hong Kong)
  if (['HND', 'ICN', 'HKG'].includes(toCode) || ['HND', 'ICN', 'HKG'].includes(fromCode)) {
    return {
      baseMinutes: 440,
      basePrice: 32000,
      domestic: false,
      category: 'East Asia'
    };
  }

  // Europe (London, Paris, Rome, Barcelona, Amsterdam, Zurich, Frankfurt, Vienna, Prague)
  if (regionTo === 'Europe' || regionFrom === 'Europe') {
    return {
      baseMinutes: 540,
      basePrice: 41000,
      domestic: false,
      category: 'Europe'
    };
  }

  // Africa (Cape Town, Mauritius, Cairo, Nairobi)
  if (regionTo === 'Africa' || regionFrom === 'Africa') {
    return {
      baseMinutes: 430,
      basePrice: 36000,
      domestic: false,
      category: 'Africa'
    };
  }

  // North America (New York, SF, LA, Toronto, Vancouver, Chicago)
  if (regionTo === 'North America' || regionFrom === 'North America') {
    return {
      baseMinutes: 920,
      basePrice: 62000,
      domestic: false,
      category: 'North America'
    };
  }

  // Oceania (Sydney, Melbourne, Auckland)
  if (regionTo === 'Oceania' || regionFrom === 'Oceania') {
    return {
      baseMinutes: 780,
      basePrice: 56000,
      domestic: false,
      category: 'Oceania'
    };
  }

  // South America (Buenos Aires, Rio, Lima)
  if (regionTo === 'South America' || regionFrom === 'South America') {
    return {
      baseMinutes: 1240,
      basePrice: 88000,
      domestic: false,
      category: 'South America'
    };
  }

  return {
    baseMinutes: 380,
    basePrice: 28000,
    domestic: false,
    category: 'International'
  };
};

// Formats minutes into "Xh Ym"
export const formatDuration = (mins) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes > 0 ? `${minutes}m` : '00m'}`;
};

// Computes local arrival time considering departure time, duration, and time zone difference
export const computeLocalArrival = (depTime, durationMinutes, fromAirport, toAirport) => {
  const [depH, depM] = depTime.split(':').map(Number);
  const depTotalMins = depH * 60 + depM;

  const tzOffsetDiffHours = (toAirport?.tzOffsetHours ?? 5.5) - (fromAirport?.tzOffsetHours ?? 5.5);
  const tzDiffMins = Math.round(tzOffsetDiffHours * 60);

  // Arrival total local minutes from departure midnight
  const arrTotalLocalMins = depTotalMins + durationMinutes + tzDiffMins;

  // Day offset calculation
  let dayOffset = 0;
  let normalizedMins = arrTotalLocalMins;

  while (normalizedMins >= 1440) {
    dayOffset += 1;
    normalizedMins -= 1440;
  }
  while (normalizedMins < 0) {
    dayOffset -= 1;
    normalizedMins += 1440;
  }

  const arrH = Math.floor(normalizedMins / 60);
  const arrM = normalizedMins % 60;

  const formattedTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

  let dayOffsetLabel = 'Same Day';
  if (dayOffset === 1) dayOffsetLabel = '+1 Day';
  else if (dayOffset === 2) dayOffsetLabel = '+2 Days';
  else if (dayOffset === -1) dayOffsetLabel = '-1 Day';

  const tzDiffDisplay =
    tzOffsetDiffHours === 0
      ? 'Same Timezone'
      : tzOffsetDiffHours > 0
      ? `+${tzOffsetDiffHours}h ahead`
      : `${tzOffsetDiffHours}h behind`;

  return {
    time: formattedTime,
    dayOffset,
    dayOffsetLabel,
    tzDiffDisplay,
    isNextDay: dayOffset > 0,
    depTz: fromAirport?.timezone || 'IST',
    arrTz: toAirport?.timezone || 'Local'
  };
};

// Domestic Flight Schedule Templates
const DOMESTIC_SCHEDULES = [
  {
    airlineIndex: 0, // IndiGo
    depTime: '06:05',
    stops: 0,
    flightNumOffset: 204,
    priceMod: 0.92,
    aircraft: 'Airbus A320neo',
    amenities: ['USB In-seat Power', 'Pre-book Meals', 'Express Check-in'],
    baggage: '7kg Cabin + 15kg Check-in',
    refundable: false,
    changeFee: 2499
  },
  {
    airlineIndex: 1, // Air India
    depTime: '08:30',
    stops: 0,
    flightNumOffset: 102,
    priceMod: 1.05,
    aircraft: 'Airbus A350-900',
    amenities: ['Complimentary Hot Breakfast', 'HD Screens', 'Extra Legroom'],
    baggage: '7kg Cabin + 20kg Check-in',
    refundable: true,
    changeFee: 1499
  },
  {
    airlineIndex: 2, // Vistara
    depTime: '11:15',
    stops: 0,
    flightNumOffset: 840,
    priceMod: 1.15,
    aircraft: 'Airbus A321neo',
    amenities: ['Three-course Meal', 'In-seat Wi-Fi streaming', 'Premium Service'],
    baggage: '7kg Cabin + 20kg Check-in',
    refundable: true,
    changeFee: 1200
  },
  {
    airlineIndex: 3, // Akasa Air
    depTime: '13:40',
    stops: 0,
    flightNumOffset: 114,
    priceMod: 0.88,
    aircraft: 'Boeing 737 MAX 8',
    amenities: ['Cafe Akasa Gourmet Menu', 'USB Charging', 'Ergonomic Seats'],
    baggage: '7kg Cabin + 15kg Check-in',
    refundable: false,
    changeFee: 2200
  },
  {
    airlineIndex: 0, // IndiGo (1 Stop)
    depTime: '15:20',
    stops: 1,
    durationExtraMins: 90,
    layoverCity: 'Connecting Hub',
    layoverDuration: '1h 30m',
    flightNumOffset: 531,
    priceMod: 0.84,
    aircraft: 'Airbus A320neo',
    amenities: ['Buy-on-board Snacks', 'Standard Recline'],
    baggage: '7kg Cabin + 15kg Check-in',
    refundable: false,
    changeFee: 2499
  },
  {
    airlineIndex: 1, // Air India
    depTime: '18:10',
    stops: 0,
    flightNumOffset: 440,
    priceMod: 1.08,
    aircraft: 'Boeing 787-8 Dreamliner',
    amenities: ['Dinner Included', 'In-flight Entertainment', 'Spacious Overhead Bins'],
    baggage: '7kg Cabin + 23kg Check-in',
    refundable: true,
    changeFee: 1499
  },
  {
    airlineIndex: 2, // Vistara (Evening)
    depTime: '20:30',
    stops: 0,
    flightNumOffset: 924,
    priceMod: 1.10,
    aircraft: 'Airbus A321neo',
    amenities: ['Chef Special Dinner', 'Curated Music & Movies', 'AC Outlets'],
    baggage: '7kg Cabin + 20kg Check-in',
    refundable: true,
    changeFee: 1200
  },
  {
    airlineIndex: 0, // IndiGo (Late Night Saver)
    depTime: '22:45',
    stops: 0,
    flightNumOffset: 618,
    priceMod: 0.86,
    aircraft: 'Airbus A321neo',
    amenities: ['Midnight Refreshment', 'Express Boarding Available'],
    baggage: '7kg Cabin + 15kg Check-in',
    refundable: false,
    changeFee: 2499
  }
];

// International Flight Schedule Templates
const INTERNATIONAL_SCHEDULES = [
  {
    airlineIndex: 4, // Emirates
    depTime: '04:30',
    stops: 0,
    flightNumOffset: 501,
    priceMod: 1.22,
    aircraft: 'Boeing 777-300ER',
    amenities: ['Ice Entertainment (6500+ channels)', 'Multi-course Dining', 'Wi-Fi onboard', 'AC Outlets'],
    baggage: '7kg Cabin + 30kg Check-in (2 Pieces)',
    refundable: true,
    changeFee: 2999
  },
  {
    airlineIndex: 1, // Air India (Direct International)
    depTime: '07:15',
    stops: 0,
    flightNumOffset: 131,
    priceMod: 0.98,
    aircraft: 'Boeing 787-9 Dreamliner',
    amenities: ['Complimentary Indian & Global Dining', 'Complimentary Drinks', 'In-flight Screens'],
    baggage: '8kg Cabin + 2x23kg Check-in',
    refundable: true,
    changeFee: 2500
  },
  {
    airlineIndex: 7, // Qatar Airways
    depTime: '10:00',
    stops: 1,
    durationExtraMins: 110,
    layoverCity: 'Doha (Hamad Int’l DOH)',
    layoverDuration: '2h 15m',
    flightNumOffset: 557,
    priceMod: 1.16,
    aircraft: 'Airbus A350-1000',
    amenities: ['Oryx One Entertainment', 'World-Class Hospitality', 'USB & AC Outlets', 'Amenity Kit'],
    baggage: '7kg Cabin + 30kg Check-in',
    refundable: true,
    changeFee: 3200
  },
  {
    airlineIndex: 5, // Singapore Airlines
    depTime: '12:45',
    stops: 0,
    flightNumOffset: 423,
    priceMod: 1.25,
    aircraft: 'Airbus A350-900',
    amenities: ['KrisWorld HD Entertainment', 'Chef-curated Meals & Fine Wines', 'Free Wi-Fi for KrisFlyer'],
    baggage: '7kg Cabin + 30kg Check-in',
    refundable: true,
    changeFee: 2800
  },
  {
    airlineIndex: 6, // British Airways
    depTime: '15:30',
    stops: 0,
    flightNumOffset: 198,
    priceMod: 1.18,
    aircraft: 'Boeing 777-200',
    amenities: ['High Life Entertainment', 'Complimentary Bar Service', 'Noise-cancelling headsets'],
    baggage: '23kg Cabin + 23kg Check-in',
    refundable: false,
    changeFee: 3500
  },
  {
    airlineIndex: 8, // Lufthansa
    depTime: '18:20',
    stops: 1,
    durationExtraMins: 125,
    layoverCity: 'Frankfurt (FRA)',
    layoverDuration: '2h 40m',
    flightNumOffset: 759,
    priceMod: 1.12,
    aircraft: 'Boeing 747-8 Intercontinental',
    amenities: ['German Engineering Comfort', 'Warm Bavarian Meals', 'FlyNet Satellite Wi-Fi'],
    baggage: '8kg Cabin + 23kg Check-in',
    refundable: true,
    changeFee: 3000
  },
  {
    airlineIndex: 9, // Etihad Airways
    depTime: '21:10',
    stops: 1,
    durationExtraMins: 95,
    layoverCity: 'Abu Dhabi (AUH)',
    layoverDuration: '1h 50m',
    flightNumOffset: 205,
    priceMod: 1.14,
    aircraft: 'Boeing 787-10 Dreamliner',
    amenities: ['E-BOX Cinema Screens', 'Luxurious Recline', 'Universal Power', 'Halal Gourmet Dining'],
    baggage: '7kg Cabin + 30kg Check-in',
    refundable: true,
    changeFee: 2900
  },
  {
    airlineIndex: 4, // Emirates (Midnight Non-stop)
    depTime: '23:35',
    stops: 0,
    flightNumOffset: 507,
    priceMod: 1.19,
    aircraft: 'Airbus A380-800 Superjumbo',
    amenities: ['Onboard Lounge Experience', 'Gourmet Supper', 'Deep Recline Ergonomic Seating'],
    baggage: '7kg Cabin + 30kg Check-in',
    refundable: true,
    changeFee: 2999
  }
];

// Generates flight results dynamically for any origin/destination pair
export const getFlightsForRoute = (fromCode, toCode, cabinClass = 'Economy') => {
  if (!fromCode || !toCode) return [];

  const { baseMinutes, basePrice, domestic, category } = estimateFlightDetails(fromCode, toCode);

  const cabinMultipliers = {
    Economy: 1.0,
    'Premium Economy': 1.45,
    Business: 2.75,
    First: 4.2
  };
  const multiplier = cabinMultipliers[cabinClass] || 1.0;

  const fromAirport = getAirportByCode(fromCode);
  const toAirport = getAirportByCode(toCode);

  const scheduleList = domestic ? DOMESTIC_SCHEDULES : INTERNATIONAL_SCHEDULES;

  const flights = scheduleList.map((tmpl, idx) => {
    let airline = AIRLINES[tmpl.airlineIndex];

    const durationMins = baseMinutes + (tmpl.durationExtraMins || 0);
    const arrivalInfo = computeLocalArrival(tmpl.depTime, durationMins, fromAirport, toAirport);
    const finalPrice = Math.round(basePrice * tmpl.priceMod * multiplier);

    const flightId = `FL-${fromCode}${toCode}-${100 + idx}`;

    return {
      id: flightId,
      flightNumber: `${airline.code}-${tmpl.flightNumOffset}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      airlineBgLight: airline.bgLight,
      fromAirport: fromAirport.code,
      fromCity: fromAirport.city,
      fromAirportName: fromAirport.name,
      fromCountry: fromAirport.country,
      toAirport: toAirport.code,
      toCity: toAirport.city,
      toAirportName: toAirport.name,
      toCountry: toAirport.country,
      isDomestic: domestic,
      category,
      departureTime: tmpl.depTime,
      arrivalTime: arrivalInfo.time,
      isNextDay: arrivalInfo.isNextDay,
      dayOffsetLabel: arrivalInfo.dayOffsetLabel,
      tzDiffDisplay: arrivalInfo.tzDiffDisplay,
      depTz: arrivalInfo.depTz,
      arrTz: arrivalInfo.arrTz,
      duration: formatDuration(durationMins),
      durationMinutes: durationMins,
      stops: tmpl.stops,
      stopDetails: tmpl.stops === 0 ? 'Non-stop' : `1 Stop via ${tmpl.layoverCity || 'Hub'} (${tmpl.layoverDuration || '2h'})`,
      layoverCity: tmpl.layoverCity || null,
      layoverDuration: tmpl.layoverDuration || null,
      price: finalPrice,
      cabinClass: cabinClass,
      aircraft: tmpl.aircraft,
      amenities: tmpl.amenities,
      baggage: tmpl.baggage,
      refundable: tmpl.refundable,
      changeFee: tmpl.changeFee,
      seatsAvailable: 2 + ((idx * 3) % 7)
    };
  });

  return flights;
};

// Flexible Date Price Calendar Generator
export const getFlexibleDateFares = (fromCode, toCode, baseDateStr, cabinClass = 'Economy') => {
  if (!fromCode || !toCode || !baseDateStr) return [];

  const { basePrice } = estimateFlightDetails(fromCode, toCode);
  const cabinMultipliers = {
    Economy: 1.0,
    'Premium Economy': 1.45,
    Business: 2.75,
    First: 4.2
  };
  const multiplier = cabinMultipliers[cabinClass] || 1.0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseDate = new Date(baseDateStr);
  const dates = [];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offset);

    // Skip past dates
    if (d < today) continue;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Deterministic pseudo-random fluctuation based on date
    const daySeed = (d.getDate() * 17 + d.getMonth() * 31 + offset * 7) % 20;
    const fluctuationPercent = (daySeed - 8) / 100;
    const estimatedFare = Math.round(basePrice * 0.94 * (1 + fluctuationPercent) * multiplier);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dates.push({
      dateStr,
      dayName,
      formattedDisplay,
      price: estimatedFare,
      isSelected: dateStr === baseDateStr,
      isLowest: false
    });
  }

  // Mark the lowest fare
  if (dates.length > 0) {
    const minPrice = Math.min(...dates.map((item) => item.price));
    dates.forEach((item) => {
      if (item.price === minPrice) {
        item.isLowest = true;
      }
    });
  }

  return dates;
};
