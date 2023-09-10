import { NextResponse } from 'next/server';
import { get_schedule } from 'app/schedule.js';

export async function GET(_, { params }) {
  const { class_name } = params;

  const result = await get_schedule(class_name);

  return NextResponse.json(result, { status: 200 });
}
