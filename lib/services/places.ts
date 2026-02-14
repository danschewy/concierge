import type { Restaurant } from '@/lib/types';
import { mockRestaurants } from '@/lib/mock-data';

const GOOGLE_PLACES_API = 'https://places.googleapis.com/v1/places:searchText';

interface GooglePlaceResult {
  id: string;
  displayName?: {
    text?: string;
  };
  rating?: number;
  priceLevel?: string;
  types?: string[];
  formattedAddress?: string;
  currentOpeningHours?: {
    openNow?: boolean;
  };
  photos?: Array<{
    name?: string;
  }>;
}

interface GooglePlacesResponse {
  places?: GooglePlaceResult[];
}

function mapPriceLevel(priceLevel?: string): number {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
      return 0;
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1;
    case 'PRICE_LEVEL_MODERATE':
      return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
      return 3;
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 4;
    default:
      return 2;
  }
}

function extractCuisineTypes(types?: string[]): string[] {
  if (!types) return ['Restaurant'];

  const cuisineMap: Record<string, string> = {
    italian_restaurant: 'Italian',
    chinese_restaurant: 'Chinese',
    japanese_restaurant: 'Japanese',
    mexican_restaurant: 'Mexican',
    french_restaurant: 'French',
    indian_restaurant: 'Indian',
    thai_restaurant: 'Thai',
    korean_restaurant: 'Korean',
    american_restaurant: 'American',
    mediterranean_restaurant: 'Mediterranean',
    seafood_restaurant: 'Seafood',
    pizza_restaurant: 'Pizza',
    sushi_restaurant: 'Sushi',
    steak_house: 'Steakhouse',
    cafe: 'Cafe',
    bakery: 'Bakery',
    bar: 'Bar',
    fine_dining_restaurant: 'Fine Dining',
    fast_food_restaurant: 'Fast Food',
  };

  const cuisines: string[] = [];
  for (const type of types) {
    if (cuisineMap[type]) {
      cuisines.push(cuisineMap[type]);
    }
  }

  return cuisines.length > 0 ? cuisines : ['Restaurant'];
}

function buildPhotoUrl(photoName?: string, apiKey?: string): string | undefined {
  if (!photoName || !apiKey) return undefined;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${apiKey}`;
}

export async function searchRestaurants(
  query: string,
  location?: string,
  priceLevel?: number,
  openNow?: boolean
): Promise<Restaurant[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn('GOOGLE_PLACES_API_KEY not set, using mock data');
    return mockRestaurants;
  }

  try {
    const textQuery = location
      ? `${query} restaurants in ${location}`
      : `${query} restaurants in SoHo, New York City`;

    const requestBody: Record<string, unknown> = {
      textQuery,
      maxResultCount: 10,
      includedType: 'restaurant',
    };

    if (openNow) {
      requestBody.openNow = true;
    }

    if (priceLevel !== undefined) {
      const priceLevels = [
        'PRICE_LEVEL_INEXPENSIVE',
        'PRICE_LEVEL_MODERATE',
        'PRICE_LEVEL_EXPENSIVE',
        'PRICE_LEVEL_VERY_EXPENSIVE',
      ];
      if (priceLevel >= 1 && priceLevel <= 4) {
        requestBody.priceLevels = [priceLevels[priceLevel - 1]];
      }
    }

    const response = await fetch(GOOGLE_PLACES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.rating,places.priceLevel,places.types,places.formattedAddress,places.currentOpeningHours,places.photos',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Google Places API error: ${response.status}`);
      return mockRestaurants;
    }

    const data: GooglePlacesResponse = await response.json();

    if (!data.places || data.places.length === 0) {
      return mockRestaurants;
    }

    return data.places.map((place) => ({
      id: place.id,
      name: place.displayName?.text ?? 'Unknown',
      rating: place.rating ?? 0,
      priceLevel: mapPriceLevel(place.priceLevel),
      cuisine: extractCuisineTypes(place.types),
      address: place.formattedAddress ?? '',
      isOpen: place.currentOpeningHours?.openNow ?? true,
      photoUrl: buildPhotoUrl(place.photos?.[0]?.name, apiKey),
    }));
  } catch (error) {
    console.error('Error fetching Google Places:', error);
    return mockRestaurants;
  }
}
