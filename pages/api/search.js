import { get_classes } from '../../schedule.js';

export default async function handler(req, res) {
  const { term } = req.query;

  try {
    const result = await get_classes(term);
    res.status(200).json(result);
  } catch (error) {
    console.error(error)
    res.status(500).json(error);
  }
}
