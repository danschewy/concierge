import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json(
        { error: 'Trip ID is required' },
        { status: 400 }
      );
    }

    // Mock ride status
    const status = {
      id: tripId,
      driverName: 'Marcus',
      vehicle: 'Black Tesla Model Y',
      licensePlate: 'T649-82C',
      etaMinutes: 3,
      fare: '$24',
      status: 'en_route',
      pickup: 'Broadway & Spring St',
      dropoff: 'David Geffen Hall',
      routeCoordinates: [
        [-73.9976, 40.7243],
        [-74.006, 40.7258],
        [-74.0099, 40.731],
        [-74.0089, 40.742],
        [-74.002, 40.756],
        [-73.987, 40.768],
        [-73.9835, 40.7725],
      ],
      driverLocation: [-74.002, 40.742],
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Uber status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride status' },
      { status: 500 }
    );
  }
}
