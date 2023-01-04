import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  generate();
  res.status(200).json({ name: "John Doe" });
}
