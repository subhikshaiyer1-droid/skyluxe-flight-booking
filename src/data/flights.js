// Flights Data, Route Engine, and Flexible Calendar Estimator for SkyLuxe
import { getAirportByCode, AIRPORTS } from './airports';

export const AIRLINES = [
  {
    name: 'IndiGo',
    code: '6E',
    color: '#002E6E',
    bgLight: '#E8F1FC',
    logoText: '6E'
  },
  {
    name: 'Air India',
    code: 'AI',
    color: '#C7081B',
    bgLight: '#FDECEE',
    logoText: 'AI'
  },
  {
    name: 'Emirates',
    code: 'EK',
    color: '#D71921',
    bgLight: '#FCECEE',
    logoText: 'EK'
  },
  {
    name: 'Singapore Airlines',
    code: 'SQ',
    color: '#00266B',
    bgLight: '#EBF1FB',
    logoText: 'SQ'
  },
  {
    name: 'British Airways',
    code: 'BA',
    color: '#075AAA',
    bgLight: '#ECF3FB',
    logoText: 'BA'
  },
  {
    name: 'Vistara',
    code: 'UK',
    color: '#5C1D41',
    bgLight: '#F7EDF3',
    logoText: 'UK'
  },
  {
    name: 'Qatar Airways',
    code: 'QR',
    color: '#5C0632',
    bgLight: '#F7EAF0',
    logoText: 'QR'
  }
];

// List of all Indian Domestic Airport codes
const INDIAN_AIRPORT_CODES = [
  'BOM', 'DEL', 'BLR', 'MAA', 'HYD', 'CCU', 'GOI', 'JAI', 'UDR',
  'COK', 'CJB', 'IXE', 'SXR', 'IXL', 'KUU', 'IXC', 'IXB', 'GAU',
  'IXZ', 'DED', 'VNS', 'ATQ', 'TRV', 'AGX'
];

// Helper to estimate flight duration & base price based on airports
export const estimateFlightDetails = (fromCode, toCode) => {
  const isFromDomestic = INDIAN_AIRPORT_CODES.includes(fromCode);
  const isToDomestic = INDIAN_AIRPORT_CODES.includes(toCode);
  const isDomestic = isFromDomestic && isToDomestic;

  const isGulf = fromCode === 'DXB' || toCode === 'DXB';
  const isSEAsia =
    fromCode === 'SIN' || toCode === 'SIN' ||
    fromCode === 'BKK' || toCode === 'BKK' ||
    fromCode === 'HKT' || toCode === 'HKT' ||
    fromCode === 'DPS' || toCode === 'DPS';

  const isFarEast = fromCode === 'HND' || toCode === 'HND' || fromCode === 'ICN' || toCode === 'ICN';
  const isEurope =
    fromCode === 'LHR' || toCode === 'LHR' ||
    fromCode === 'CDG' || toCode === 'CDG' ||
    fromCode === 'FCO' || toCode === 'FCO' ||
    fromCode === 'BCN' || toCode === 'BCN' ||
    fromCode === 'AMS' || toCode === 'AMS' ||
    fromCode === 'PRG' || toCode === 'PRG' ||
    fromCode === 'ZRH' || toCode === 'ZRH' ||
    fromCode === 'IST' || toCode === 'IST';

  const isUltraLongHaul =
    fromCode === 'JFK' || toCode === 'JFK' ||
    fromCode === 'SYD' || toCode === 'SYD' ||
    fromCode === 'CPT' || toCode === 'CPT' ||
    fromCode === 'MRU' || toCode === 'MRU';

  if (isDomestic) {
    return { baseMinutes: 135, basePrice: 4200, domestic: true };
  } else if (isGulf) {
    return { baseMinutes: 220, basePrice: 16800, domestic: false };
  } else if (isSEAsia) {
    return { baseMinutes: 300, basePrice: 18500, domestic: false };
  } else if (isFarEast) {
    return { baseMinutes: 440, basePrice: 32000, domestic: false };
  } else if (isEurope) {
    return { baseMinutes: 540, basePrice: 41000, domestic: false };
  } else if (isUltraLongHaul) {
    return { baseMinutes: 840, basePrice: 62000, domestic: false };
  } else {
    return { baseMinutes: 360, basePrice: 26000, domestic: false };
  }
};

// Formats minutes into "Xh Ym"
export const formatDuration = (mins) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes > 0 ? `${minutes}m` : '00m'}`;
};

// Computes arrival time given departure time ("HH:MM") and duration in minutes
export const computeArrivalTime = (depTime, durationMinutes) => {
  const [depH, depM] = depTime.split(':').map(Number);
  const totalMins = depH * 60 + depM + durationMinutes;
  const arrH = Math.floor((totalMins / 60) % 24);
  const arrM = totalMins % 60;
  const isNextDay = Math.floor(totalMins / 60) >= 24;
  const formattedTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
  return { time: formattedTime, nextDay: isNextDay };
};

// Schedule templates defining varied options across airlines and times
const SCHEDULE_TEMPLATES = [
  {
    airlineIndex: 0, // IndiGo
    depTime: '06:00',
    stops: 0,
    flightNumOffset: 204,
    priceMod: 0.94,
    aircraft: 'Airbus A320neo',
    amenities: ['USB Power', 'Buy-on-board Snacks'],
    baggage: '7kg Cabin + 15kg Check-in'
  },
  {
    airlineIndex: 1, // Air India
    depTime: '08:30',
    stops: 0,
    flightNumOffset: 102,
    priceMod: 1.05,
    aircraft: 'Boeing 787-8 Dreamliner',
    amenities: ['Complimentary Hot Meal', 'In-flight Screens', 'USB Port'],
    baggage: '7kg Cabin + 23kg Check-in'
  },
  {
    airlineIndex: 5, // Vistara
    depTime: '11:15',
    stops: 0,
    flightNumOffset: 840,
    priceMod: 1.12,
    aircraft: 'Airbus A321neo',
    amenities: ['Gourmet Meal', 'Free Wi-Fi (text)', 'Extra Legroom'],
    baggage: '7kg Cabin + 20kg Check-in'
  },
  {
    airlineIndex: 0, // IndiGo (1 Stop)
    depTime: '13:45',
    stops: 1,
    durationExtraMins: 90,
    stopCity: 'Connecting Hub',
    flightNumOffset: 531,
    priceMod: 0.86,
    aircraft: 'Airbus A320neo',
    amenities: ['Standard Recline', 'Snack Service'],
    baggage: '7kg Cabin + 15kg Check-in'
  },
  {
    airlineIndex: 2, // Emirates / Int'l or Air India
    depTime: '16:20',
    stops: 0,
    flightNumOffset: 501,
    priceMod: 1.25,
    aircraft: 'Boeing 777-300ER',
    amenities: ['Multi-course Dining', 'Ice Entertainment (4500+ channels)', 'AC Outlets'],
    baggage: '7kg Cabin + 30kg Check-in'
  },
  {
    airlineIndex: 3, // Singapore Airlines or British Airways
    depTime: '19:10',
    stops: 0,
    flightNumOffset: 422,
    priceMod: 1.18,
    aircraft: 'Airbus A350-900',
    amenities: ['Chef Curated Meals', 'Crisp HD Screens', 'Wi-Fi Available'],
    baggage: '7kg Cabin + 25kg Check-in'
  },
  {
    airlineIndex: 1, // Air India (Late Night)
    depTime: '21:40',
    stops: 0,
    flightNumOffset: 678,
    priceMod: 0.90,
    aircraft: 'Airbus A321neo',
    amenities: ['Dinner Included', 'Standard Recline'],
    baggage: '7kg Cabin + 20kg Check-in'
  },
  {
    airlineIndex: 4, // British Airways / 1 Stop
    depTime: '23:15',
    stops: 1,
    durationExtraMins: 110,
    stopCity: 'International Hub',
    flightNumOffset: 147,
    priceMod: 0.97,
    aircraft: 'Boeing 787-9 Dreamliner',
    amenities: ['Complimentary Drinks', 'Sleep Amenities Kit', 'USB & AC Outlets'],
    baggage: '7kg Cabin + 23kg Check-in'
  }
];

// Generates flight results dynamically for any origin/destination pair
export const getFlightsForRoute = (fromCode, toCode, cabinClass = 'Economy') => {
  if (!fromCode || !toCode) return [];

  const { baseMinutes, basePrice, domestic } = estimateFlightDetails(fromCode, toCode);

  const cabinMultipliers = {
    Economy: 1.0,
    'Premium Economy': 1.45,
    Business: 2.75,
    First: 4.2
  };
  const multiplier = cabinMultipliers[cabinClass] || 1.0;

  const fromAirport = getAirportByCode(fromCode);
  const toAirport = getAirportByCode(toCode);

  const flights = SCHEDULE_TEMPLATES.map((tmpl, idx) => {
    let airline = AIRLINES[tmpl.airlineIndex];

    // For domestic routes, replace non-domestic international carriers with Indian favorites
    if (domestic && (airline.code === 'EK' || airline.code === 'SQ' || airline.code === 'BA' || airline.code === 'QR')) {
      airline = idx % 2 === 0 ? AIRLINES[0] : AIRLINES[1]; // IndiGo or Air India
    }

    const durationMins = baseMinutes + (tmpl.durationExtraMins || 0);
    const arrivalInfo = computeArrivalTime(tmpl.depTime, durationMins);
    const finalPrice = Math.round(basePrice * tmpl.priceMod * multiplier);

    return {
      id: `FL-${fromCode}${toCode}-${100 + idx}`,
      flightNumber: `${airline.code}-${tmpl.flightNumOffset}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      airlineBgLight: airline.bgLight,
      fromAirport: fromAirport.code,
      fromCity: fromAirport.city,
      fromAirportName: fromAirport.name,
      toAirport: toAirport.code,
      toCity: toAirport.city,
      toAirportName: toAirport.name,
      departureTime: tmpl.depTime,
      arrivalTime: arrivalInfo.time,
      isNextDay: arrivalInfo.nextDay,
      duration: formatDuration(durationMins),
      durationMinutes: durationMins,
      stops: tmpl.stops,
      stopDetails: tmpl.stops === 0 ? 'Non-stop' : `1 Stop via ${tmpl.stopCity}`,
      price: finalPrice,
      cabinClass: cabinClass,
      aircraft: tmpl.aircraft,
      amenities: tmpl.amenities,
      baggage: tmpl.baggage,
      seatsAvailable: 2 + ((idx * 3) % 7)
    };
  });

  return flights;
};

// Flexible Date Price Calendar Generator
// Returns 7 dates (-3 days to +3 days from baseDate) with estimated simulated fares
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
    const daySeed = (d.getDate() * 17 + d.getMonth() * 31 + offset * 7) % 20; // 0 to 19
    const fluctuationPercent = (daySeed - 8) / 100; // -8% to +11%
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
