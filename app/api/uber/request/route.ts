import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickup, dropoff, ride_type } = body;

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: 'pickup and dropoff are required' },
        { status: 400 }
      );
    }

    // Mock ride request response
    const ride = {
      id: `ride-${Date.now()}`,
      driverName: 'Marcus',
      vehicle: 'Black Tesla Model Y',
      licensePlate: 'T649-82C',
      etaMinutes: 4,
      fare: '$24',
      status: 'driver_assigned',
      pickup,
      dropoff,
      rideType: ride_type || 'UberX',
      routeCoordinates: [
        [-73.9976, 40.7243],
        [-74.006, 40.7258],
        [-74.0099, 40.731],
        [-74.0089, 40.742],
        [-74.002, 40.756],
        [-73.987, 40.768],
        [-73.9835, 40.7725],
      ],
      driverLocation: [-74.002, 40.735],
    };

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Uber request error:', error);
    return NextResponse.json(
      { error: 'Failed to request ride' },
      { status: 500 }
    );
  }
}
