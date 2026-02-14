import { NextResponse } from 'next/server';
import { buildBookingRedirectUrl } from '@/lib/utils/booking-urls';

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

    // Mock Resy reservation
    const reservation = {
      id: `res-${Date.now()}`,
      venue: 'Carbone',
      venueId: venue_id,
      date,
      time,
      partySize: party_size,
      confirmationCode: `RES-${Math.floor(10000 + Math.random() * 90000)}`,
      source: 'resy' as const,
      status: 'pending' as const,
      bookingUrl: buildBookingRedirectUrl({
        provider: 'resy',
        venue: String(venue_id),
        date: String(date),
        time: String(time),
        partySize: Number(party_size),
      }),
      cancellationPolicy: 'Free cancellation up to 24 hours before',
    };

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Resy booking error:', error);
    return NextResponse.json(
      { error: 'Failed to book reservation' },
      { status: 500 }
    );
  }
}
