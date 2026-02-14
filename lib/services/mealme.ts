import type { FoodOrder } from '@/lib/types';
import { mockFoodOrder } from '@/lib/mock-data';

/**
 * MealMe food ordering service (MOCK ONLY).
 *
 * In production, this would integrate with the MealMe API
 * for restaurant search and food ordering.
 * Currently returns mock data for demonstration purposes.
 */
export async function orderFood(
  restaurantId: string,
  items: string[],
  address: string
): Promise<FoodOrder> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const orderItems = items.map((item, index) => ({
    name: item,
    quantity: 1,
    price: mockFoodOrder.items[index]?.price ?? 5.0,
  }));

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const tax = Math.round(subtotal * 0.08875 * 100) / 100; // NYC sales tax
  const tip = Math.round(subtotal * 0.15 * 100) / 100;
  const total = Math.round((subtotal + tax + tip) * 100) / 100;

  return {
    ...mockFoodOrder,
    id: `food-${Date.now()}`,
    restaurant: restaurantId,
    items: orderItems,
    subtotal,
    tax,
    tip,
    total,
    status: 'confirmed',
  };
}
