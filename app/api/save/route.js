import { NextResponse } from 'next/server';

export async function POST(_, { params }) {
  return NextResponse(3);
}
