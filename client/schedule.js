const ics = require("ics");
const nodePickle = require("node-pickle");
const fs = require("fs");

// nodePickle.dump({ hello: "hdaf" });
// .then(data => ({
//   console.log(data);
// });

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

  return name, section;
}

function class_url(class_name) {
  return `"https://admission.umontreal.ca/cours-et-horaires/cours/${class_name}/`;
}

function get_schedule(class_name) {
  const schedule = {};
  const CACHE_INVALIDATION_THRES_S = 60 * 60;

  const file_name = `${class_name}.pickle`;
  try {
    const stats = fs.statSync(file_name);
    console.log("yep", stats);
    const file = fs.openSync(file_name, "r");
  } catch {
    console.log("nope");
    const url = class_url(class_name);
    const file = fs.openSync(file_name, "w");
  }
  //     f = open(file_name, "rb")
  //     schedule = pickle.load(f)
  // else:
  //     f = open(file_name, "wb")
  //
  //     url = class_url(class_name)
  //     result = requests.get(url)
  //     if result:
  //         if True:
  //             data = result.text
  //             soup = bs4.BeautifulSoup(data, "html.parser")
  //
  //             long_name = soup.find("h1", {"class": "featuredTitle"}).get_text()
  //             schedule_section = soup.find("section", {"class": "horaire-folder"})
  //             semesters = schedule_section.find_all("div", {"class": "fold"})
  //
  //             for semester in semesters:
  //                 semester_name = (
  //                     semester.find("span", {"class": "foldButton"})
  //                     .get_text()
  //                     .strip()
  //                 )
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
  //
  //     pickle.dump(schedule, f)

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

  const semester = "Hiver 2023";
  for (let c of classes) {
    const [class_name, section] = parse_class_name(c);
    const schedule = get_schedule(class_name);
    console.log(schedule);
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
