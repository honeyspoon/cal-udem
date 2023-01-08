import fetch from "node-fetch";
import { getVtimezoneComponent } from "@touch4it/ical-timezones";

const fs = require("fs");
const util = require("util");
const cheerio = require("cheerio");

import ical, { ICalCategory } from "ical-generator";

function parse_date(date_str, hour, min) {
  const [day, month, year] = date_str.split("/");

  return new Date(`${year}-${month}-${day} ${hour}:${min}`);
}

function parse_datetime(date_str, time_str) {
  const [, s_date, , e_date] = date_str.split(" ");
  let [, s_hour, , s_min, , e_hour, , e_min] = time_str.split(" ");

  const parsed_start_time = parse_date(s_date, s_hour, s_min);
  const parsed_end_time = parse_date(s_date, e_hour, e_min);
  const parsed_end_date = parse_date(e_date, e_hour, e_min);

  const weeks = Math.floor(
    (parsed_end_date.getTime() - parsed_start_time.getTime()) /
      (1000 * 60 * 60 * 24 * 7) +
      1
  );

  return [parsed_start_time, parsed_end_time, weeks];
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

const THRESH_S = 60 * 60 * 24;
// const THRESH_S = 5;
async function get_schedule(class_name) {
  let schedule = {};

  const file_name = `data/${class_name}.json`;

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
        for (let [, times, dates] of entries) {
          const [start_date, duration, count] = parse_datetime(dates, times);

          schedule[semester_name][section].push([start_date, duration, count]);
        }
      });
    }

    const file = await open(file_name, "w");
    await write(file, JSON.stringify(schedule));
    await close(file);
  }

  return schedule;
}

export async function generate(target_semester, classes) {
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

  const calendar = ical({ name: "my calendar" });

  calendar.timezone({
    name: "America/New_York",
    generator: getVtimezoneComponent,
  });

  const categories = new Proxy(
    {},
    {
      get: (target, name) =>
        name in target ? target[name] : new ICalCategory({ name: target }),
    }
  ); // defaultdict
  for (const [class_name, target_section, long_name, schedule] of schedules) {
    for (const [startTime, endTime, count] of schedule) {
      calendar.createEvent({
        start: startTime,
        end: endTime,
        summary: `${long_name} ${target_section}`,
        url: class_url(class_name),
        repeating: {
          freq: "WEEKLY",
          count,
        },
        categories: [
          categories["udem"],
          categories["school"],
          categories[class_name],
          categories[target_section],
          categories[long_name],
        ],
      });
    }
  }

  return calendar;
}
