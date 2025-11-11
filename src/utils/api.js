import { filterFranchise } from './franchise-filter.js';
import { mockRestaurants } from './mockData.js';

const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';

function hasSearchCredentials() {
  return (
    import.meta.env.VITE_NAVER_CLIENT_ID &&
    import.meta.env.VITE_NAVER_CLIENT_SECRET
  );
}

export async function searchRestaurants({
  query,
  display = 20,
  start = 1,
}) {
  if (!query) {
    return [];
  }

  if (!hasSearchCredentials()) {
    return filterFranchise(mockRestaurants).filter((item) =>
      item.name.includes(query) || item.address.includes(query)
    );
  }

  const url = `${NAVER_SEARCH_URL}?query=${encodeURIComponent(query)}&display=${display}&start=${start}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': import.meta.env.VITE_NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    if (!data.items) {
      return [];
    }

    return filterFranchise(
      data.items.map((item, index) => ({
        id: item.link || `${item.category}-${start + index}`,
        name: item.title.replace(/<[^>]+>/g, ''),
        address: item.roadAddress || item.address,
        category: item.category?.split('>')?.pop()?.trim() ?? '기타',
        phone: item.telephone,
        description: item.description,
      }))
    );
  } catch (error) {
    console.error('식당 검색 실패:', error);
    throw error;
  }
}

export function calculateDistance(from, to) {
  if (!from || !to) return Infinity;
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const φ1 = toRad(from.lat);
  const φ2 = toRad(to.lat);
  const Δφ = toRad(to.lat - from.lat);
  const Δλ = toRad(to.lng - from.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function restaurantsWithinRadius(restaurants, center, radius) {
  if (!center || !radius) return restaurants;
  return restaurants.filter((restaurant) => {
    if (!restaurant.lat || !restaurant.lng) return false;
    const distance = calculateDistance(center, {
      lat: restaurant.lat,
      lng: restaurant.lng,
    });
    return distance <= radius;
  });
}
