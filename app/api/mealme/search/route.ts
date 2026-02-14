import { NextResponse } from 'next/server';
import { mockRestaurants } from '@/lib/mock-data';

export async function GET() {
  try {
    // Mock MealMe restaurant search
    const restaurants = mockRestaurants.map((restaurant) => ({
      ...restaurant,
      source: 'mealme',
      deliveryFee: '$2.99',
      estimatedDelivery: '25-35 min',
      minimumOrder: '$15',
    }));

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('MealMe search error:', error);
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    );
  }
}
