import { prisma } from './db';
import { load } from 'cheerio';
import ical from 'ical-generator';
import AsyncLock from 'async-lock';
import { DateTime } from 'luxon';

const lock = new AsyncLock();

export function get_day_number(day_str) {
  return { Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5 }[day_str];
}

export function parse_date(date_str, hours, minutes) {
  const [day, month, year] = date_str.split('/');
  return DateTime.fromObject(
    {
      year,
      month,
      day,
      hours,
      minutes,
    },
    { zone: 'America/New_York' },
  ).toUnixInteger();
}

export function parse_class_name(class_name) {
  let [name, section] = class_name.split(' ');
  name = name.toLowerCase();

  return [name, section];
}

function classUrl(shortName) {
  return `https://admission.umontreal.ca/cours-et-horaires/cours/${shortName}/`;
}

export async function get_classes(term = '', semester) {
  return await prisma.course.findMany({ where: { short_name: { contains: term }, semester } });
}

async function scrape_udem(class_name, class_semester) {
  const class_data = { groups: [] };
  const events = [];

  class_data.url = classUrl(class_name);
  const res = await fetch(class_data.url);
  const data = await res.text();
  const $ = load(data);

  const long_name = $('h1.cours-titre').text();
  const semesters = $('section.cours-horaires-trimestre');

  class_data['long_name'] = long_name;
  class_data['short_name'] = class_name;
  class_data['semester'] = class_semester;

  for (let semester of semesters) {
    const semester_name = $(semester).find('h3').text().trim();

    // TODO: handle missing semester
    if (semester_name != class_semester.replace('_', ' ')) {
      continue;
    }

    const sections = $(semester)
      .find('h4')
      .toArray()
      .map((e) => $(e).text().trim().split(' ').at(-1));

    $('table', semester).each((i, t) => {
      const section = sections[i];

      const rows = $(t).find('tbody').find('tr').toArray();

      let bad = false;

      for (let row of rows) {
        const [dayCell, hoursCell, datesCell] = $(row).find('td').toArray();
        const days = $(dayCell)
          .find('.jour_long')
          .toArray()
          .map((e) => $(e).text().trim());
        const [start_time_str, end_time_str] = $(hoursCell)
          .find('span:not([class])')
          .toArray()
          .map((e) => $(e).text().trim());
        const [start_date_str, end_date_str] = $(datesCell)
          .find('span:not([class])')
          .toArray()
          .map((e) => $(e).text().trim());

        for (const day of days) {
          if (!day) {
            bad = true;
            break;
          }

          let [s_hour, , s_min] = start_time_str.split(' ');
          let [e_hour, , e_min] = end_time_str.split(' ');

          const start_datetime = parse_date(start_date_str, s_hour, s_min);
          const end_datetime = parse_date(start_date_str, e_hour, e_min);
          const end_date = parse_date(end_date_str, e_hour, e_min);

          const start_date_date = new Date(start_datetime * 1000);

          const day_offset = get_day_number(day) - start_date_date.getUTCDay();
          const day_offset_ms = day_offset * 60 * 60 * 24;

          const true_start_datetime = start_datetime + day_offset_ms;
          const true_end_datetime = end_datetime + day_offset_ms;

          const repeatCount = Math.floor((end_date - true_start_datetime) / (60 * 60 * 24 * 7) + 1);

          events.push({
            group: section,
            start: true_start_datetime,
            end: true_end_datetime,
            repeatCount,
          });
        }
      }

      if (!bad) {
        class_data.groups.push(section);
      }
    });

    console.log(class_data);
    return [class_data, events];
  }
}

export async function get_schedule(short_name, semester, withEvents = true) {
  const key = short_name.toLowerCase();

  return await lock.acquire(key, async () => {
    try {
      const db_class_data = (await prisma.course.findMany({ where: { short_name, semester } }))[0];

      if (db_class_data) {
        if (withEvents) {
          db_class_data.events = await prisma.event.findMany({
            where: { courseShort_name: key, courseSemester: semester },
          });
        }

        return db_class_data;
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const [class_data, events] = await scrape_udem(key, semester);

      const res = await prisma.course.create({
        data: { ...class_data, events: { create: events } },
        include: { events: withEvents },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  });
}

export async function generate(classes, class_semester) {
  const calendar = ical({ name: 'my calendar' });

  const classes_data = await Promise.all(
    classes.map(async (c) => {
      const [class_name, section] = parse_class_name(c);
      const class_data = await get_schedule(class_name, class_semester);

      return class_data.events
        .filter((event) => event.group == section)
        .map((event) => {
          const s = new Date(event.start * 1000);
          const e = new Date(event.end * 1000);

          return {
            start: s,
            end: e,
            summary: `${class_data['short_name'].toUpperCase()} | ${
              class_data['long_name']
            } - ${section}`,
            url: classUrl(class_name),
            repeating: {
              freq: 'WEEKLY',
              count: event.repeatCount,
            },
          };
        });
    }),
  );

  for (let c of classes_data) {
    for (let event of c) {
      calendar.createEvent(event);
    }
  }

  return calendar;
}
