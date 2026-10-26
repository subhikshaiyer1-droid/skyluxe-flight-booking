# SkyLuxe ✈️
> **“Your journey, made simple.”**

SkyLuxe is a full-featured, responsive flight booking web application developed as an academic college project. Built directly in React with Vite, JavaScript, React Router, and modern Vanilla CSS, it demonstrates complete real-world flight search, smart flight comparison, flexible date fare exploration, interactive seat selection, coupon code calculation, printable digital boarding passes, flight status tracking, and browser LocalStorage persistence.

---

## 🌟 Upgraded Interactive Features

### 1. Smart Flight Comparison
- **Lowest Fare & Fastest Route Badges**: Automatically detects and highlights the cheapest flight and fastest route among filtered results.
- **Side-by-Side Comparison Modal**: Allows selecting up to 3 flights via a "Compare" checkbox.
- **Detailed Parameter Comparison**: Clearly compares total price, duration, stops, baggage allowance, aircraft, and in-flight amenities with direct "Select & Book" action.

### 2. Flexible Date Price Calendar Strip
- Displays a 7-day price comparison strip centered on the user's chosen departure date (-3 to +3 days).
- Automatically calculates estimated daily fares and marks the lowest with a **Best Fare** badge.
- Clicking any date instantly updates the departure date and recalculates available flights in real time.

### 3. Personal Travel Wishlist & Bookmarked Flights
- Heart toggle icon on all destination cards to save/remove favourite holiday spots.
- Heart bookmark button on flight cards to save specific flight schedules.
- Dedicated **Wishlist / Saved Items** page (`/saved`) with tabs for Destinations and Flights.
- Persisted safely across browser sessions in `localStorage` under `skyluxe_saved_destinations` and `skyluxe_saved_flights`.

### 4. 44+ Destination Catalog & Interactive Trip Planner
- Expanded catalog of **44 curated destinations** covering domestic India (Jaipur, Udaipur, Kochi, Munnar, Ooty, Coorg, Srinagar, Leh, Manali, Shimla, Darjeeling, Gangtok, Shillong, Andaman, Rishikesh, Goa, Delhi, Mumbai, Bengaluru, Kolkata, Varanasi, Amritsar, Lakshadweep, Trivandrum) and top global getaways (Bali, Bangkok, Phuket, Tokyo, Seoul, Maldives, Istanbul, Rome, Barcelona, Amsterdam, Prague, Zurich, Mauritius, Cape Town, New York, Sydney).
- Every destination maps to an active airport code in `src/data/airports.js` with functional flight generation.
- **Trip Planner Modal**: Shows 3 recommended attractions, a suggested 3-day itinerary, and an itemized estimated trip budget (hotel, food, transit, sightseeing).

### 5. Interactive Demo Seat Selection
- Step-by-step seat selection map displaying an 8-row airplane cabin.
- Visual distinctions for **Available**, **Window (+₹150)**, **Aisle (+₹120)**, **Extra Legroom (+₹350)**, **Occupied/Unavailable**, and **Selected**.
- Allows choosing exactly 1 seat per passenger, preventing duplicate selections.
- Seat fees are transparently integrated into the final ticket fare.

### 6. Demo Coupon Codes & Detailed Fare Breakdown
- Promo coupon input on the booking page supporting:
  - `SKY10`: 10% off eligible base fare.
  - `FIRST500`: ₹500 flat off when base fare $\ge$ ₹3,000.
  - `STUDENT20`: 20% off base fare (special academic project promo!).
- Inline validation with green success tag or clear error messages.
- Itemized fare breakdown showing Base Fare, Taxes & GST (12%), User Development Fee, Seat Upgrade Fees, Coupon Discount, and Final Amount.
- Exact calculated fare carries over into the Boarding Pass and saved booking record.

### 7. Simulated Flight Status Tracker (`/flight-status`)
- Look up flights by 6-digit PNR reference (e.g. `SLX-849201`) or flight number (e.g. `6E-204`).
- Visual 5-stage progress timeline: **Scheduled $\rightarrow$ Check-in Open $\rightarrow$ Boarding $\rightarrow$ Departed / In Air $\rightarrow$ Arrived**.
- Displays gate number, terminal, carousel baggage belt, and aircraft model.
- Quick-select chips of your saved bookings for 1-click testing.

### 8. Enhanced My Bookings Page (`/my-bookings`)
- Filter tabs: **All Bookings**, **Upcoming**, **Past Travels**, and **Cancelled**.
- Real-time navigation badge showing count of active (non-cancelled) bookings.
- Displays PNR, passenger name, route, travel date, seat numbers, applied coupon, and final fare paid.
- **Cancel Demo Booking** with confirmation dialog: marks ticket as `CANCELLED (DEMO)` and updates the navbar badge immediately.
- Actions to **View Boarding Pass**, **Track Flight Status**, or **Delete Record**.

### 9. Traveller Profile (`/profile`)
- Store full legal name, email, phone number, preferred seat, and preferred airline.
- Persisted locally in `localStorage` under `skyluxe_traveller_profile`.
- Displays a **"⚡ Auto-fill from Profile"** button on the booking page to pre-populate details in 1 click.

---

## 🎨 Visual Design System

- **Sky Blue**: `#2684FF` (Primary interactive color)
- **Dark Navy**: `#183153` (Branding, headings, and high contrast)
- **White**: `#FFFFFF` (Card surfaces)
- **Light Blue Background**: `#F2F7FF` (Subtle modern background)
- **Orange Accent**: `#FF9F43` (Action tags, alerts, badges)
- **Typography**: `Inter` and `Plus Jakarta Sans` via Google Fonts.

---

## 📁 Project Directory Structure

```text
skyluxe/
├── index.html                   # HTML entry with Inter & Plus Jakarta Sans Google Fonts
├── package.json                 # React 19, Vite, React Router, Lucide Icons, Canvas Confetti
├── README.md                    # Comprehensive documentation & presentation guide
├── vite.config.js               # Vite bundler config
└── src/
    ├── main.jsx                 # Application entry point
    ├── App.jsx                  # Main router declaring all 9 application routes
    ├── components/
    │   ├── Navbar.jsx           # Responsive navbar with wishlist & active bookings badges
    │   ├── Footer.jsx           # Footer with links and academic demo notice
    │   ├── FlightSearchForm.jsx # Search card with validation, swap button, & date pickers
    │   ├── FlightCard.jsx       # Card with timeline, compare checkbox, & wishlist heart
    │   ├── FlightCompareModal.jsx # Side-by-side comparison modal for up to 3 flights
    │   ├── DestinationCard.jsx  # Destination card with wishlist toggle & Trip Planner
    │   ├── DestinationTripPlannerModal.jsx # 3-day itinerary & expense budget breakdown
    │   └── SeatSelector.jsx     # Interactive airplane cabin seat selection map
    ├── pages/
    │   ├── HomePage.jsx         # Hero, search form, 3 steps, and top getaways
    │   ├── SearchResultsPage.jsx# Flexible date calendar, flight cards, sorting, filters
    │   ├── BookingPage.jsx      # Passenger details, profile auto-fill, seat map, coupons
    │   ├── ConfirmationPage.jsx # Boarding pass ticket, simulated barcode, & printable sheet
    │   ├── MyBookingsPage.jsx   # Upcoming/Past/Cancelled bookings with cancellation
    │   ├── DestinationsPage.jsx # 44+ destination catalog with regional & category filters
    │   ├── SavedItemsPage.jsx   # Saved destinations and bookmarked flights wishlist
    │   ├── FlightStatusPage.jsx # Simulated live flight tracker with PNR search
    │   ├── ProfilePage.jsx      # Traveller profile management for 1-click checkout
    │   └── AboutPage.jsx        # Project overview, tech stack, & Viva Presentation Guide
    ├── data/
    │   ├── airports.js          # Domestic & International airport hubs
    │   ├── flights.js           # Dynamic flight generation & flexible date calendar engine
    │   └── destinations.js      # 44 curated destinations with 3-day itineraries & budgets
    └── styles/
        ├── index.css            # Custom CSS properties, color variables, and resets
        └── App.css              # Responsive layouts, cards, seat map, and animations
```

---

## 🚀 How to Run the Project

1. Navigate to the project directory:
   ```powershell
   cd C:\Users\Subhiksha\.gemini\antigravity-ide\scratch\skyluxe
   ```

2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```

3. Start the local development server:
   ```powershell
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

5. To verify production build:
   ```powershell
   npm run build
   ```

---

## 🧪 Testing Checklist & Demonstration Guide

1. **Flight Search & Validation**:
   - On the homepage or search drawer, select the same city for Origin and Destination (e.g. Mumbai to Mumbai) $\rightarrow$ verify the error: *"Origin and destination cannot be identical."*
   - Click the swap button $\rightarrow$ verify Origin and Destination exchange positions smoothly.
   - Try choosing a past date $\rightarrow$ verify validation error prevents submission.

2. **Flight Results & Comparison**:
   - Search flights from Mumbai (`BOM`) to Delhi (`DEL`).
   - Check the **Flexible Date Strip** at the top $\rightarrow$ click any adjacent date to see flight schedules and fares update instantly.
   - Check the **Lowest Fare** and **Fastest Route** badges on the top flight cards.
   - Check the **"Compare flight"** checkbox on 2 or 3 flight cards $\rightarrow$ observe the floating compare bar at the bottom.
   - Click **"Compare Now"** $\rightarrow$ review the side-by-side comparison modal and click **"Select & Book"**.

3. **Seat Selection & Coupon Codes**:
   - On the booking page, interact with the **Airplane Cabin Seat Map** $\rightarrow$ click seats (Window, Aisle, Extra Legroom) and notice the seat fee dynamically added to the Fare Breakdown on the right.
   - Enter demo coupon `SKY10` or `STUDENT20` and click **Apply** $\rightarrow$ verify green success message and discount deducted from total.
   - Try an invalid coupon (e.g. `FAKE100`) $\rightarrow$ verify helpful error message appears.

4. **Boarding Pass & Print**:
   - Complete the form and click **Confirm Demo Booking** $\rightarrow$ observe confetti celebration, unique PNR (e.g. `SLX-849201`), selected seat numbers, and barcode.
   - Click **Print Boarding Pass / Confirmation** $\rightarrow$ opens print preview with clean styling.

5. **My Bookings & Cancellation**:
   - Navigate to **My Bookings** $\rightarrow$ verify your booking is listed with route, date, seat, and coupon.
   - Click **Track** $\rightarrow$ opens Flight Status page displaying the 5-stage progress timeline for that PNR.
   - Click **Cancel** $\rightarrow$ confirm in the modal $\rightarrow$ verify the booking status updates to *CANCELLED (DEMO)* and active badge in the Navbar updates.

6. **Destinations & Trip Planner**:
   - Visit the **Destinations** page $\rightarrow$ explore all 44 destinations.
   - Filter by **Domestic India** or **International**.
   - Click **Trip Planner** on any destination (e.g. Munnar, Leh Ladakh, Tokyo, Paris) $\rightarrow$ view 3 recommended attractions, 3-day itinerary, and itemized estimated budget.
   - Click the **Heart icon** $\rightarrow$ open **Wishlist** (`/saved`) to verify it persists.

7. **Traveller Profile**:
   - Visit `/profile` $\rightarrow$ save your name, email, and phone $\rightarrow$ visit Booking Page $\rightarrow$ click **"Auto-fill from Profile"** $\rightarrow$ inputs populate in 1 click!

---

## 🎓 College Viva & Presentation Q&A

All key technical concepts—such as how client-side routing works, how distance-based flight algorithms operate, and how LocalStorage enables full state persistence without an external backend—are documented interactively in the **About Us** page (`/about#viva`).
