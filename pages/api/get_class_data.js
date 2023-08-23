import { get_schedule } from "../../schedule";

export default async function handler(req, res) {
  const { class_name } = req.query;

  try {
    const result = await get_schedule(class_name, false)
    res.status(200).json(result);
  } catch (e) {
    console.error(e)
    res.status(404).json({ e });
  }
}
