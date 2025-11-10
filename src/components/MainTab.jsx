import React, { useEffect, useMemo, useState } from 'react';
import Map from './Map.jsx';
import RestaurantCard from './RestaurantCard.jsx';
import { mockRestaurants } from '../utils/mockData.js';
import { filterFranchise } from '../utils/franchise-filter.js';
import { restaurantsWithinRadius, searchRestaurants } from '../utils/api.js';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // Seoul City Hall

const radiusToMeters = {
  '500m': 500,
  '1km': 1000,
  '2km': 2000,
  '3km': 3000,
};

export default function MainTab({ language, t, onSaveRestaurant, savedRestaurants, focusRestaurant, onClearFocus, keywordFilters, onClearKeywords }) {
  const mainTexts = t.main;
  const commonTexts = t.common;

  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState('1km');
  const [selectedCategories, setSelectedCategories] = useState(new Set(['all']));
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(mockRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);

  const categories = useMemo(() => Object.entries(mainTexts.categoryOptions), [mainTexts.categoryOptions]);


  useEffect(() => {
    if (!focusRestaurant) return;
    const { lat, lng } = focusRestaurant;
    setCenter((prev) => ({
      lat: lat ?? prev.lat,
      lng: lng ?? prev.lng,
    }));
    setSelectedRestaurant(focusRestaurant);
    onClearFocus?.();
  }, [focusRestaurant, onClearFocus]);

  useEffect(() => {
    if (!keywordFilters || keywordFilters.length === 0) return;
    const derived = keywordFilters
      .map((keyword) => resolveCategoryFromKeyword(keyword))
      .filter(Boolean);
    if (derived.length) {
      setSelectedCategories(new Set(derived));
      setSelectedRestaurant(null);
    }
    onClearKeywords?.();
  }, [keywordFilters, onClearKeywords]);
  useEffect(() => {
    if (!query) {
      setSearchResults(mockRestaurants);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const results = await searchRestaurants({ query });
        setSearchResults(results.length ? results : mockRestaurants);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredRestaurants = useMemo(() => {
    const activeCategories = selectedCategories.has('all')
      ? categories.map(([key]) => key)
      : Array.from(selectedCategories);

    const normalizedRestaurants = searchResults.map((item) => {
      if (item.lat && item.lng) return item;
      // fallback coordinates: use default center offset to ensure map interactions still work
      return {
        ...item,
        lat: item.lat ?? center.lat + Math.random() * 0.01,
        lng: item.lng ?? center.lng + Math.random() * 0.01,
      };
    });

    const withinRadius = restaurantsWithinRadius(
      normalizedRestaurants,
      center,
      radiusToMeters[radius]
    );

    const byCategory = withinRadius.filter((restaurant) => {
      if (selectedCategories.has('all')) return true;
      return activeCategories.includes(resolveCategoryKey(restaurant.category));
    });

    return filterFranchise(byCategory);
  }, [categories, center, radius, searchResults, selectedCategories]);

  const savedIds = useMemo(() => new Set(savedRestaurants.map((item) => item.id)), [savedRestaurants]);

  const handleCategoryChange = (key) => {
    setSelectedRestaurant(null);
    setSelectedCategories((prev) => {
      const updated = new Set(prev);
      if (key === 'all') {
        if (updated.has('all')) {
          updated.clear();
        } else {
          updated.clear();
          updated.add('all');
        }
        return updated.size ? updated : new Set(['all']);
      }

      if (updated.has(key)) {
        updated.delete(key);
      } else {
        updated.add(key);
      }
      updated.delete('all');
      if (!updated.size) {
        updated.add('all');
      }
      return updated;
    });
  };

  const handleRandomPick = () => {
    if (!filteredRestaurants.length) return;
    setIsRouletteSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
      setSelectedRestaurant(filteredRestaurants[randomIndex]);
      setIsRouletteSpinning(false);
    }, 1200);
  };

  const handleSave = () => {
    if (!selectedRestaurant) return;
    const restaurant = {
      ...selectedRestaurant,
      savedAt: new Date().toISOString(),
    };
    onSaveRestaurant(restaurant);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(
        language === 'ko'
          ? '이 브라우저에서는 위치 정보를 사용할 수 없습니다.'
          : 'Geolocation is not supported in this browser.'
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        alert(
          language === 'ko'
            ? '현재 위치를 가져오지 못했습니다. 위치 권한을 확인해주세요.'
            : 'Unable to retrieve your location. Please check permissions.'
        );
      }
    );
  };

  const rouletteMessage = isRouletteSpinning ? mainTexts.rouletteMessage : null;

  return (
    <section className="main-tab">
      <div className="main-tab__controls">
        <div className="panel">
          <h2>{mainTexts.title}</h2>
          <p className="panel__description">{mainTexts.description}</p>

          <div className="form-group">
            <label htmlFor="search" className="form-label">
              🔍 {commonTexts.searchPlaceholder}
            </label>
            <input
              id="search"
              type="search"
              className="input"
              placeholder={commonTexts.searchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="form-group inline">
            <span className="form-label">📏 {mainTexts.radiusLabel}</span>
            <div className="radio-group">
              {mainTexts.radiusOptions.map((option) => (
                <label key={option} className="radio">
                  <input
                    type="radio"
                    name="radius"
                    value={option}
                    checked={radius === option}
                    onChange={() => setRadius(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <span className="form-label">🍽️ {mainTexts.categoriesLabel}</span>
            <div className="checkbox-group">
              {categories.map(([key, label]) => (
                <label key={key} className="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(key)}
                    onChange={() => handleCategoryChange(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="hint">{mainTexts.franchiseTip}</p>
          </div>

          <div className="form-group buttons">
            <button type="button" className="btn btn-outline" onClick={handleCurrentLocation}>
              📍 {mainTexts.useCurrentLocation}
            </button>
            <button type="button" className="btn btn-primary pulse" onClick={handleRandomPick}>
              {mainTexts.randomButton}
            </button>
          </div>

          {rouletteMessage && <div className="roulette-message">{rouletteMessage}</div>}

          {isLoading && <div className="skeleton">{commonTexts.loading}</div>}
          {error && <div className="error">{commonTexts.error}</div>}

          {!isLoading && !selectedRestaurant && !filteredRestaurants.length && (
            <div className="empty-state">{commonTexts.noResults}</div>
          )}

          {selectedRestaurant && (
            <RestaurantCard
              restaurant={selectedRestaurant}
              language={language}
              labels={{ ...mainTexts.card, save: mainTexts.save }}
              actions={[
                {
                  label: mainTexts.reroll,
                  onClick: handleRandomPick,
                  variant: 'secondary',
                },
              ]}
              onSave={handleSave}
              isSaved={savedIds.has(selectedRestaurant.id)}
            />
          )}
        </div>
      </div>
      <div className="main-tab__map">
        <Map
          center={center}
          selectedRestaurant={selectedRestaurant}
          onSelectLocation={setCenter}
          language={language}
        />
        {!selectedRestaurant && (
          <p className="map-hint">{mainTexts.locationHelper}</p>
        )}
        {selectedRestaurant && (
          <div className="map-actions">
            <button type="button" className="btn btn-secondary" onClick={handleRandomPick}>
              {mainTexts.reroll}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleSave} disabled={savedIds.has(selectedRestaurant.id)}>
              {savedIds.has(selectedRestaurant.id) ? (language === 'ko' ? '이미 저장됨' : 'Saved') : mainTexts.save}
            </button>
            <a
              className="btn btn-primary"
              href={`https://map.naver.com/v5/directions/${center.lat},${center.lng}/${selectedRestaurant.lat},${selectedRestaurant.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {mainTexts.directions}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}


function resolveCategoryFromKeyword(keyword = '') {
  const lower = keyword.toLowerCase();
  if (lower.includes('매운') || lower.includes('spice')) return 'korean';
  if (lower.includes('국') || lower.includes('soup') || lower.includes('ramen')) return 'japanese';
  if (lower.includes('샐러드') || lower.includes('salad') || lower.includes('healthy')) return 'asian';
  if (lower.includes('가성비') || lower.includes('value') || lower.includes('분식')) return 'korean';
  if (lower.includes('데이트') || lower.includes('romantic') || lower.includes('fine')) return 'western';
  if (lower.includes('카페') || lower.includes('cafe') || lower.includes('dessert')) return 'cafe';
  if (lower.includes('디저트') || lower.includes('dessert')) return 'dessert';
  if (lower.includes('모험') || lower.includes('fusion') || lower.includes('global')) return 'asian';
  if (lower.includes('집밥') || lower.includes('comfort')) return 'korean';
  return null;
}

function resolveCategoryKey(category = '') {
  const lower = category.toLowerCase();
  if (lower.includes('한식') || lower.includes('korean')) return 'korean';
  if (lower.includes('중식') || lower.includes('chinese')) return 'chinese';
  if (lower.includes('일식') || lower.includes('japanese') || lower.includes('sushi')) return 'japanese';
  if (lower.includes('양식') || lower.includes('western') || lower.includes('italian')) return 'western';
  if (lower.includes('아시안') || lower.includes('asian') || lower.includes('태국') || lower.includes('베트남')) return 'asian';
  if (lower.includes('카페') || lower.includes('cafe')) return 'cafe';
  if (lower.includes('디저트') || lower.includes('dessert')) return 'dessert';
  if (lower.includes('술집') || lower.includes('bar') || lower.includes('pub')) return 'pub';
  return 'all';
}
