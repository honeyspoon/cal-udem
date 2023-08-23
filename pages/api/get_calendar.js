import { generate } from '../../schedule.js';

export default async function handler(req, res) {
  const entries = req.query['entries'].split(',');

  if (entries.every((c) => c != '')) {
    const calendar = await generate(entries);
    calendar.serve(res);
  } else {
    res.send('no classes');
  }
}
