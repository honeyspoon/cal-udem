import { NextResponse } from 'next/server';
import { generate } from 'app/schedule.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const entries = searchParams.get('entries').split(',');

  if (entries.every((c) => c != '')) {
    const calendar = await generate(entries);
    return new NextResponse(calendar.toString(), { status: 200 });
  } else {
    return new NextResponse.json({ err: 'no classes' }, { status: 404 });
  }
}
