import { get_schedule } from "../../schedule.js";

export default async function handler(req, res) {
  const { class_name } = req.query;

  const result = await get_schedule(class_name)
  delete result["Hiver 2023"]

  result["Automne 2023"] = Object.keys(result["Automne 2023"])

  res.status(200).json(result)
}
