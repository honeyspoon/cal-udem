import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  const classes = req.query["classes"].split(",");

  if (classes.every((c) => c != "")) {
    const calendar = await generate(classes);
    calendar.serve(res);
  } else {
    res.send("no classes");
  }
}
