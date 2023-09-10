import { NextResponse } from 'next/server';
import { get_schedule } from 'app/schedule';

export async function GET(_, { params }) {
  const { class_name } = params;

  try {
    const result = await get_schedule(class_name, false);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ e }, { status: 404 });
  }
}
