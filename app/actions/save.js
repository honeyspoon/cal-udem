'use server';

import { prisma } from './../db';

import getUuid from 'uuid-by-string';

export async function save(class_data, semester) {
  const id = getUuid(JSON.stringify(class_data) + semester);
  const res = await prisma.schedule.upsert({
    where: { id },
    create: { class_data, id, semester },
    update: {},
  });

  return res;
}

export async function load(saveId) {
  const res = await prisma.schedule.findUnique({
    where: { id: saveId },
  });

  return res;
}
