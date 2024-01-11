'use server';

import { prisma } from './../db';

export async function save(class_data) {
  const res = await prisma.schedule.create({
    data: { class_data },
  });

  return res;
}

export async function load(saveId) {
  const res = await prisma.schedule.findUnique({
    where: { id: saveId },
  });

  return res;
}
