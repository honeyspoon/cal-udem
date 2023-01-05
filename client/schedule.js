import fetch from "node-fetch";

const ics = require("ics");
const fs = require("fs");
const util = require("util");
const cheerio = require("cheerio");

function parse_date(date_str) {
  const [day, month, year] = date_str.split("/");

  return [year, month, day];
}

function parse_datetime(date_str, time_str) {
  const [, s_date, , e_date] = date_str.split(" ");
  let [, s_hour, , s_min, , e_hour, , e_min] = time_str.split(" ");

  const parsed_start_date = parse_date(s_date);
  const parsed_end_date = parse_date(e_date);

  const start_date = [...parsed_start_date, s_hour, s_min].map((e) =>
    parseInt(e)
  );
  const duration = { hours: e_hour - s_hour, minutes: e_min - s_min + 1 };
  const count = 1;

  return [start_date, duration, count];
}

function parse_class_name(class_name) {
  let [name, section] = class_name.split("-");
  name = name.toLowerCase();
  name = name.replace(" ", "-");

  return [name, section];
}

function class_url(class_name) {
  return `https://admission.umontreal.ca/cours-et-horaires/cours/${class_name}/`;
}

const open = util.promisify(fs.open);
const close = util.promisify(fs.close);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const write = util.promisify(fs.write);

async function get_schedule(class_name) {
  let schedule = {};

  const file_name = `data/${class_name}.json`;
  const THRESH_S = 60 * 60 * 2;

  try {
    // TODO: get rid of this
    // I hate this control flow with exceptions
    // gotta find a way to have the fs options return a tuple of a result and an error and match it
    const stats = await stat(file_name);
    const current_ts = Math.floor(Date.now());
    const m = (current_ts - stats.mtime) / 1000;

    if (m > THRESH_S) {
      throw new Error("old");
    }

    const file = await open(file_name, "r");
    const res = await readFile(file);
    const data = res.toString().toString();
    schedule = JSON.parse(data);
    await close(file);
  } catch (err) {
    const file = await open(file_name, "w");
    const url = class_url(class_name);
    const res = await fetch(url);
    const data = await res.text();
    const $ = cheerio.load(data);
    const long_name = $("h1.featuredTitle").text();
    const semesters = $("section.horaire-folder > div.fold").slice(0, -1);

    schedule["long_name"] = long_name;

    for (let semester of semesters) {
      const semester_name = $(semester).find(".foldButton").text().trim();
      schedule[semester_name] = {};
      const sections = $(semester)
        .find("h4")
        .toArray()
        .map((e) => $(e).text().trim().split(" ").at(-1));

      $("table", semester).each((i, t) => {
        const section = sections[i];
        schedule[semester_name][section] = [];
        const entries = $(t)
          .find("tr")
          .slice(1)
          .toArray()
          .map((row) =>
            $(row)
              .find("td")
              .toArray()
              .map((cell) => $(cell).text().trim())
          );
        for (let [_, times, dates] of entries) {
          const [start_date, duration, count] = parse_datetime(dates, times);

          schedule[semester_name][section].push([start_date, duration, count]);
        }
      });
    }

    await write(file, JSON.stringify(schedule));
    await close(file);
  }

  return schedule;
}

export async function generate() {
  const classes = [
    "MAT 1410-A",
    "MAT 1410-A101",
    "MAT 2050-A",
    "MAT 2050-A101",
    "PHY 1441-A",
    "PHY 1441-A1",
    "PHY 1620-A",
    "PHY 1620-A1",
    "PHY 1652-A",
    "PHY 1652-A1",
  ];

  const target_semester = "Hiver 2023";
  const schedules = await Promise.all(
    classes.map(async (c) => {
      const [class_name, section] = parse_class_name(c);
      const schedule = await get_schedule(class_name);
      return [
        class_name,
        section,
        schedule["long_name"],
        schedule[target_semester][section],
      ];
    })
  );

  const events = [];
  for (const [class_name, target_section, long_name, schedule] of schedules) {
    for (const [start, duration, count] of schedule) {
      events.push({
        start,
        duration,
        title: `${long_name} ${target_section}`,
        description: "",
        location: "udem",
        url: "https://www.google.com",
        // geo: { lat: 40.0095, lon: 105.2669 },
        categories: ["school", class_name, target_semester, target_section],
        busyStatus: "BUSY",
        organizer: { name: "Admin", email: "bobmatt911@gmail.com" },
        recurrenceRule: `FREQ=WEEKLY;INTERVAL=1;COUNT=${count}`,
        attendees: [
          {
            name: "Adam Gibbons",
            email: "adam@example.com",
            rsvp: true,
            partstat: "ACCEPTED",
            role: "REQ-PARTICIPANT",
          },
          {
            name: "Brittany Seaton",
            email: "brittany@example2.org",
            dir: "https://linkedin.com/in/brittanyseaton",
            role: "OPT-PARTICIPANT",
          },
        ],
      });
    }
  }

  const cal = await createEventAsync(events);
  await fs.writeFileSync("my_cal.ics", cal);
  return cal;
  // return "sup";
}

function createEventAsync(events) {
  return new Promise((resolve, reject) => {
    ics.createEvents(events, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}
