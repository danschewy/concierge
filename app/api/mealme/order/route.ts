import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, items, delivery_address } = body;

    if (!restaurant_id || !items || !delivery_address) {
      return NextResponse.json(
        { error: 'restaurant_id, items, and delivery_address are required' },
        { status: 400 }
      );
    }

    // Mock food order response
    const order = {
      id: `order-${Date.now()}`,
      restaurant: 'Absolute Bagels',
      items: Array.isArray(items)
        ? items.map((item: string, i: number) => ({
            name: item,
            quantity: 1,
            price: 3.5 + i * 0.5,
          }))
        : [],
      subtotal: 7.5,
      tax: 0.67,
      deliveryFee: 2.99,
      tip: 0.95,
      total: 12.11,
      status: 'confirmed',
      etaMinutes: 30,
      deliveryAddress: delivery_address,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('MealMe order error:', error);
    return NextResponse.json(
      { error: 'Failed to place food order' },
      { status: 500 }
    );
  }
}
