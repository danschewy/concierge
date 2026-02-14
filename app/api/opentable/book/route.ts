import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { venue_id, date, time, party_size } = body;

    if (!venue_id || !date || !time || !party_size) {
      return NextResponse.json(
        { error: 'venue_id, date, time, and party_size are required' },
        { status: 400 }
      );
    }

    // Mock OpenTable reservation
    const reservation = {
      id: `ot-${Date.now()}`,
      venue: 'Balthazar',
      venueId: venue_id,
      date,
      time,
      partySize: party_size,
      confirmationCode: `OT-${Math.floor(10000 + Math.random() * 90000)}`,
      source: 'opentable' as const,
      status: 'confirmed' as const,
      dinerPointsEarned: 100,
      cancellationPolicy: 'Free cancellation up to 1 hour before',
    };

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('OpenTable booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book reservation' },
      { status: 500 }
    );
  }
}
