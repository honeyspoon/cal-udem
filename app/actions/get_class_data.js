'use server';

import { get_schedule } from 'app/schedule';

export async function get_class_data(semester, class_name) {
  const result = await get_schedule(class_name, semester, false);
  return result;
}

export async function get_class_schedule(semester, class_name) {
  const result = await get_schedule(class_name, semester);
  return result;
}
