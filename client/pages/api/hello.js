import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  const cal = await generate();
  res.status(200).send(cal);
}
