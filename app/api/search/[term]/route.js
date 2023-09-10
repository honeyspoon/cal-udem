import { NextResponse } from 'next/server';

import { get_classes } from 'app/schedule.js';

export async function GET(_, { params }) {
  const { term } = params;

  try {
    const result = await get_classes(term);
    return NextResponse.json(result.splice(0, 10), { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 404 });
  }
}
