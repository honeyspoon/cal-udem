import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  const classes = req.query["classes"].split(",");
  const cal = await generate(classes);
  res.status(200).send(cal);
}
