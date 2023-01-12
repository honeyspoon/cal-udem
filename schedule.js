import fetch from "node-fetch";
import S3 from "aws-sdk/clients/s3.js";

require("dotenv").config();

const accountid = process.env.CLOUDFLARE_ACCOUNT_ID;
const access_key_id = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const access_key_secret = process.env.CLOUDFLARE_ACCESS_KEY_SECRET;

const s3 = new S3({
  endpoint: `https://${accountid}.r2.cloudflarestorage.com`,
  accessKeyId: `${access_key_id}`,
  secretAccessKey: `${access_key_secret}`,
  signatureVersion: "v4",
});
const Bucket = "schedules";

const cheerio = require("cheerio");

import ical, { ICalCategory } from "ical-generator";

function parse_date(date_str, hour, min) {
  const [day, month, year] = date_str.split("/");

  return new Date(`${year}-${month}-${day} ${hour}:${min}`).getTime();
}

function parse_datetime(date_str, time_str) {
  const [, s_date, , e_date] = date_str.split(" ");
  let [, s_hour, , s_min, , e_hour, , e_min] = time_str.split(" ");

  const parsed_start_time = parse_date(s_date, s_hour, s_min);
  const parsed_end_time = parse_date(s_date, e_hour, e_min);
  const parsed_end_date = parse_date(e_date, e_hour, e_min);

  const weeks = Math.floor(
    (parsed_end_date - parsed_start_time) / (1000 * 60 * 60 * 24 * 7) + 1
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
const THRESH_S = 60 * 60 * 24 * 7; // a week
// const THRESH_S = 5;
async function get_schedule(class_name) {
  let schedule = {};

  const key = `${class_name}.json`;
  try {
    // TODO: get rid of this
    // I hate this control flow with exceptions
    // gotta find a way to have the fs options return a tuple of a result and an error and match it
    const current_ts = Math.floor(Date.now());

    const res = await s3
      .getObject({
        Key: key,
        Bucket,
      })
      .promise();

    const m = (current_ts - res["LastModified"]) / 1000;
    if (m > THRESH_S) {
      throw new Error("old");
    }

    const data = res["Body"];
    schedule = JSON.parse(data);
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

    await s3
      .putObject({
        Key: key,
        Body: JSON.stringify(schedule),
        Bucket,
      })
      .promise();
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
  // const tz = "Europe/London";
  const tz = "America/New_York";
  calendar.timezone(tz);

  let a = true;
  for (const [class_name, target_section, long_name, schedule] of schedules) {
    for (const [startTime, endTime, count] of schedule) {
      const eventParams = {
        start: new Date(startTime),
        end: new Date(endTime),
        summary: `${long_name} ${target_section}`,
        url: class_url(class_name),
        timezone: "America/New_York",
        repeating: {
          freq: "WEEKLY",
          count,
        },
      };
      calendar.createEvent(eventParams);
      if (a) {
        const e = calendar.events()[0];
        console.log(startTime, e.start(), tz);
        console.log(e.toString());
        a = false;
      }
    }
  }

  process.env.TZ = "";

  return calendar;
}
