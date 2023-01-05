import fetch from "node-fetch";

const ics = require("ics");
const fs = require("fs");
const util = require("util");
const cheerio = require("cheerio");

function parse_weekday(weekday) {
  d = {
    Lundi: 0,
    Mardi: 1,
    Mercredi: 2,
    Jeudi: 3,
    Vendredi: 4,
    Samedi: 5,
    Dimanche: 6,
  };

  return d[weekday];
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
const read = util.promisify(fs.read);
const readFile = util.promisify(fs.readFile);
const write = util.promisify(fs.write);

async function get_schedule(class_name) {
  let schedule;

  const file_name = `${class_name}.json`;
  // const THRESH_S = 60 * 60;
  const THRESH_S = 1;

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
    console.log(err);
    const file = await open(file_name, "w");
    const url = class_url(class_name);
    const res = await fetch(url);
    const data = await res.text();
    const $ = cheerio.load(data);
    const long_name = $("h1.featuredTitle").text();
    const semesters = $("section.horaire-folder > div.fold");
    for (let semester of semesters) {
      const name = $(semester).find("span.foldButton").text().trim();
      const sections = $(semester).find(".foldContent > h4");
      for (let section of sections) {
        console.log(section.text());
      }
      console.log(sections);
    }

    schedule = { long_name };

    await write(file, JSON.stringify(schedule));
    await close(file);
  }

  console.log("schedule", schedule);

  //                 sections = [
  //                     section.get_text().strip().split(" ")[-1]
  //                     for section in semester.find_all("h4")
  //                 ]
  //                 tables = semester.find_all("table")
  //                 schedule[semester_name] = {}
  //                 for section, table in zip(sections, tables):
  //                     entries = [
  //                         [cell.get_text().strip() for cell in row.find_all("td")]
  //                         for row in table.find_all("tr")[1:]
  //                     ]
  //                     schedule[semester_name][section] = []
  //                     for day, hours, dates in entries:
  //                         start_date, end_date = parse_dates(dates)
  //
  //                         start_time, end_time = parse_times(hours)
  //                         schedule["long_name"] = long_name
  //                         schedule[semester_name][section].append(
  //                             [
  //                                 start_date,
  //                                 end_date,
  //                                 start_time,
  //                                 end_time,
  //                             ]
  //                         )

  return schedule;
}

export async function generate() {
  const classes = [
    "MAT 1410-A",
    // "MAT 1410-A101",
    // "MAT 2050-A",
    // "MAT 2050-A101",
    // "PHY 1441-A",
    // "PHY 1441-A1",
    // "PHY 1620-A",
    // "PHY 1620-A1",
    // "PHY 1652-A",
    // "PHY 1652-A1",
  ];

  const semester = "Hiver 2023";
  for (let c of classes) {
    const [class_name, section] = parse_class_name(c);
    const schedule = get_schedule(class_name);
    // console.log(schedule);
  }

  const event = {
    start: [2018, 5, 30, 6, 30],
    duration: { hours: 6, minutes: 30 },
    title: "Bolder Boulder",
    description: "Annual 10-kilometer run in Boulder, Colorado",
    location: "Folsom Field, University of Colorado (finish line)",
    url: "http://www.bolderboulder.com/",
    geo: { lat: 40.0095, lon: 105.2669 },
    categories: ["10k races", "Memorial Day Weekend", "Boulder CO"],
    status: "CONFIRMED",
    busyStatus: "BUSY",
    organizer: { name: "Admin", email: "Race@BolderBOULDER.com" },
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
  };

  return await createEventAsync([event]);
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
