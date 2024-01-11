'use server';

import { get_classes } from 'app/schedule.js';

export async function search(semester, term) {
  const result = await get_classes(term, semester);
  return result;
}
