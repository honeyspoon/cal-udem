import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  const classes = req.query["classes"].split(",");
  const target_semester = req.query["semester"];
  const cal = await generate(target_semester, classes);
  res.status(200).send(cal);
}
