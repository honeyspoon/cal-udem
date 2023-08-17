import { get_schedule, get_classes } from "../../schedule.js";

export default async function handler(req, res) {
  const { term } = req.query;
  try {
    const result = await get_classes()
    const classes = result.Contents.map(e => e.Key.split('.')[0])
    const filtered_classes = classes.filter(e => e.includes(term))
    res.status(200).json(filtered_classes);
  } catch (error) {
    console.log('error', error)
    res.status(500).json(error);
  }
}
