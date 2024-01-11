import { NextResponse } from 'next/server';
import { get_schedule } from 'app/schedule.js';

export async function GET(_, { params }) {
  const { class_name, semester } = params;

  console.log(semester);
  const result = await get_schedule(class_name, semester);

  return NextResponse.json(result, { status: 200 });
}
