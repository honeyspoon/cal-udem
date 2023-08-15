import { get_schedule, get_classes } from "../../schedule.js";

export default async function handler(req, res) {
  const { term, semester } = req.query;
  const classes = await get_classes();
  if (classes) {
    res.status(200).json(classes);
  }

  if (!classes) {
    const sched = await get_schedule(term);
    res.status(200).json(sched);
  }
}
