import { generate } from "../../schedule.js";

export default async function handler(req, res) {
  const classes = req.query["classes"].split(",");
  const target_semester = req.query["semester"];

  if (classes.every((c) => c != "")) {
    const calendar = await generate(target_semester, classes);
    calendar.serve(res);
  } else {
    res.send("no classes");
  }
}
