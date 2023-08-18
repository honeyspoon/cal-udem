import fetch from "node-fetch";
import S3 from "aws-sdk/clients/s3.js";

require("dotenv").config();
const { zonedTimeToUtc } = require("date-fns-tz");

const accountid = process.env.CLOUDFLARE_ACCOUNT_ID;
const access_key_id = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const access_key_secret = process.env.CLOUDFLARE_ACCESS_KEY_SECRET;

const s3 = new S3({
  endpoint: `https://${accountid}.r2.cloudflarestorage.com`,
  accessKeyId: `${access_key_id}`,
  secretAccessKey: `${access_key_secret}`,
  signatureVersion: 'v4',
});

const SEMESTER = "Automne 2023"

const Bucket = "schedules2";

const cheerio = require("cheerio");

import ical from "ical-generator";

function parse_date(date_str, hour, min) {
  const [day, month, year] = date_str.split("/");
  return zonedTimeToUtc(
    `${year}-${month}-${day} ${hour}:${min}`,
    "America/New_York"
  ).getTime();
}

function parse_datetime(start_time_str, end_time_str, start_date_str, end_date_str) {
  let [s_hour, , s_min] = start_time_str.split(" ");
  let [e_hour, , e_min] = end_time_str.split(" ");

  const parsed_start_datetime = parse_date(start_date_str, s_hour, s_min);
  const parsed_end_datetime = parse_date(start_date_str, e_hour, e_min);
  const parsed_end_date = parse_date(end_date_str, e_hour, e_min);

  return [parsed_start_datetime, parsed_end_datetime, parsed_end_date];
}

function parse_class_name(class_name) {
  let [name, section] = class_name.split(" ");
  name = name.toLowerCase();

  return [name, section];
}

function class_url(class_name) {
  return `https://admission.umontreal.ca/cours-et-horaires/cours/${class_name}/`;
}

const THRESH_S = 60 * 60 * 24 * 7; // a week
// const THRESH_S = 5;

export async function get_classes() {
  var params = {
    Bucket,
    Prefix: ''
  };
  return s3.listObjectsV2(params).promise();
}

export async function get_schedule(class_name) {
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

    const long_name = $("h1.cours-titre").text();
    const semesters = $("section.cours-horaires-trimestre");

    schedule["short_name"] = class_name;
    schedule["long_name"] = long_name;

    for (let semester of semesters) {
      const semester_name = $(semester).find("h3").text().trim();
      schedule[semester_name] = {};

      const sections = $(semester)
        .find("h4")
        .toArray()
        .map((e) => $(e).text().trim().split(" ").at(-1));

      $("table", semester).each((i, t) => {
        const section = sections[i];
        schedule[semester_name][section] = [];
        const rows = $(t)
          .find('tbody')
          .find("tr")
          .toArray();


        function get_day_number(day_str) {
          return { "Lundi": 1, "Mardi": 2, "Mercredi": 4, "Jeudi": 5, "Vendredi": 5 }[day_str];
        }

        for (let row of rows) {
          const [dayCell, hoursCell, datesCell] = $(row).find('td').toArray();
          const day = $(dayCell).find('.jour_long').text().trim()
          const [start_time_str, end_time_str] = $(hoursCell).find('span:not([class])').toArray().map(e => $(e).text().trim())
          const [start_date_str, end_date_str] = $(datesCell).find('span:not([class])').toArray().map(e => $(e).text().trim())
          const [start_datetime, end_datetime, end_date] = parse_datetime(start_time_str, end_time_str, start_date_str, end_date_str)

          const start_date_date = new Date(start_datetime);
          const day_offset_ms = (start_date_date.getDay() + 1 - get_day_number(day)) * 60 * 60 * 24 * 1000;
          const true_start_datetime = start_datetime - day_offset_ms;
          const true_end_datetime = end_datetime - day_offset_ms;

          const count = Math.floor(
            (end_date - true_start_datetime) / (1000 * 60 * 60 * 24 * 7) + 1
          );

          schedule[semester_name][section].push([true_start_datetime, true_end_datetime, count]);
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

export async function generate(classes) {
  const schedules = await Promise.all(
    classes.map(async (c) => {
      const [class_name, section] = parse_class_name(c);
      const schedule = await get_schedule(class_name);
      return [
        class_name,
        section,
        schedule["long_name"],
        schedule[SEMESTER][section],
      ];
    })
  );

  const calendar = ical({ name: "my calendar" });
  const tz = "America/New_York";
  calendar.timezone(tz);

  for (const [class_name, target_section, long_name, schedule] of schedules) {
    for (const [startTime, endTime, count] of schedule) {
      const s = new Date(startTime).toLocaleString("en-US", {
        timeZone: "America/New_York",
      });
      const e = new Date(endTime).toLocaleString("en-US", {
        timeZone: "America/New_York",
      });
      const eventParams = {
        start: s,
        end: e,
        summary: `${long_name} ${target_section}`,
        url: class_url(class_name),
        repeating: {
          freq: "WEEKLY",
          count,
        },
      };
      calendar.createEvent(eventParams);
    }
  }

  return calendar;
}
