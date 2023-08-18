import { get_schedule } from '../../schedule.js';

export default async function handler(req, res) {
  const { class_name } = req.query;

  const result = await get_schedule(class_name);

  res.status(200).json(result);
}
