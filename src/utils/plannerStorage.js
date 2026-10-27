// LocalStorage utilities for Recent Searches, Budget Plans, and Multi-City Itineraries

// ----------------------------------------------------
// 1. Recent Searches
// ----------------------------------------------------
const RECENT_SEARCHES_KEY = 'skyluxe_recent_searches';

export const getRecentSearches = () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (searchData) => {
  if (!searchData?.from || !searchData?.to) return;
  try {
    const list = getRecentSearches();
    // Filter out identical existing route
    const filtered = list.filter(
      (item) => !(item.from === searchData.from && item.to === searchData.to)
    );
    const updated = [
      {
        ...searchData,
        timestamp: new Date().toISOString()
      },
      ...filtered
    ].slice(0, 5); // Keep max 5 recent searches

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('skyluxe_recent_searches_updated'));
  } catch (err) {
    console.warn('Failed to save recent search:', err);
  }
};

export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    window.dispatchEvent(new Event('skyluxe_recent_searches_updated'));
  } catch (err) {
    console.warn('Failed to clear recent searches:', err);
  }
};

// ----------------------------------------------------
// 2. Saved Trip Budget Plans
// ----------------------------------------------------
const BUDGET_PLANS_KEY = 'skyluxe_saved_trip_plans';

export const getSavedBudgetPlans = () => {
  try {
    const raw = localStorage.getItem(BUDGET_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveBudgetPlan = (plan) => {
  try {
    const list = getSavedBudgetPlans();
    const existingIndex = list.findIndex((p) => p.id === plan.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        {
          ...plan,
          id: plan.id || `PLAN-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...list
      ];
    }
    localStorage.setItem(BUDGET_PLANS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('skyluxe_budget_plans_updated'));
    return updated;
  } catch (err) {
    console.warn('Failed to save budget plan:', err);
    return [];
  }
};

export const deleteBudgetPlan = (planId) => {
  try {
    const list = getSavedBudgetPlans();
    const updated = list.filter((p) => p.id !== planId);
    localStorage.setItem(BUDGET_PLANS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('skyluxe_budget_plans_updated'));
    return updated;
  } catch (err) {
    console.warn('Failed to delete budget plan:', err);
    return [];
  }
};

// ----------------------------------------------------
// 3. Multi-City Itineraries
// ----------------------------------------------------
const MULTI_CITY_KEY = 'skyluxe_multicity_itineraries';

export const getSavedMultiCityItineraries = () => {
  try {
    const raw = localStorage.getItem(MULTI_CITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveMultiCityItinerary = (itinerary) => {
  try {
    const list = getSavedMultiCityItineraries();
    const existingIndex = list.findIndex((item) => item.id === itinerary.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...itinerary, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        {
          ...itinerary,
          id: itinerary.id || `MC-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...list
      ];
    }
    localStorage.setItem(MULTI_CITY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('skyluxe_multicity_updated'));
    return updated;
  } catch (err) {
    console.warn('Failed to save multi-city itinerary:', err);
    return [];
  }
};

export const deleteMultiCityItinerary = (itineraryId) => {
  try {
    const list = getSavedMultiCityItineraries();
    const updated = list.filter((item) => item.id !== itineraryId);
    localStorage.setItem(MULTI_CITY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('skyluxe_multicity_updated'));
    return updated;
  } catch (err) {
    console.warn('Failed to delete multi-city itinerary:', err);
    return [];
  }
};
