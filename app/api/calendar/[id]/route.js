import { generate } from 'app/schedule.js';
import { prisma } from 'app/db';

export async function GET(_, { params }) {
  const { id } = params;

  const res = await prisma.schedule.findUnique({
    where: { id },
  });

  if (res) {
    let classes = [];
    for (let [k, v] of Object.entries(res.class_data)) {
      for (let group of Object.keys(v.groups)) {
        classes.push(k + ' ' + group);
      }
    }
    const calendar = await generate(classes, res.semester);
    return new Response(calendar.toString());
  } else {
    return Response.json({ err: 'bad id' });
  }
}
