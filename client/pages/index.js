import Head from "next/head";

import styles from "../styles/Home.module.css";
import {
  useQueryParam,
  StringParam,
  ArrayParam,
  withDefault,
} from "use-query-params";

import React, { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import frLocale from "@fullcalendar/core/locales/fr";

const initialDate = "2023-01-09";

function calendarURL(semester, classes) {
  const base_url = "/api/get_calendar";

  const params = new URLSearchParams();
  params.set("classes", classes);
  params.set("semester", semester);

  const url = `${base_url}?${params.toString()}`;
  return url;
}

// TODO:
const semesters = ["Hiver 2023", "Automne 2022", "Hiver 2022"];

export default function Home() {
  const [semester, setSemester] = useQueryParam(
    "semester",
    withDefault(StringParam, semesters[0])
  );
  const [classes, setClasses] = useQueryParam(
    "classes",
    withDefault(ArrayParam, [])
  );

  const [calUrl, setCalUrl] = useState(calendarURL(semester, classes));

  useEffect(() => {
    setCalUrl(calendarURL(semester, classes));
  }, [classes, semester]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Calendier udem</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Calendrier udem</h1>

        <div className="mt-5 md:col-span-2 md:mt-0">
          <div className="overflow-hidden shadow sm:rounded-md">
            <div className="col-span-6 sm:col-span-3">
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                onChange={(e) => {
                  setSemester(e.target.value);
                }}
              >
                {semesters.map((s, i) => (
                  <option key={i}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <input
          type="text"
          onKeyUp={(e) => {
            if (e.keyCode === 13) {
              const s = new Set(classes);
              s.add(event.target.value);
              setClasses(Array.from(s));
              e.target.value = "";
            }
          }}
        />

        {Array.from(classes).map((e, i) => (
          <div key={i}>
            {e}{" "}
            <button
              onClick={() => {
                const s = new Set(classes);
                s.delete(e);
                setClasses(Array.from(s));
              }}
            >
              X
            </button>
          </div>
        ))}

        <a
          className="mt-5 px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          href={calendarURL(semester, classes)}
          download="calendar.ics"
        >
          Exporter en .ics
        </a>
      </main>

      {classes.length > 0 && (
        <FullCalendar
          plugins={[timeGridPlugin, iCalendarPlugin]}
          initialView="timeGridWeek"
          locales={frLocale}
          locale="fr"
          weekends={false}
          timeZone="America/New_York"
          initialDate={initialDate}
          slotMinTime={"08:00:00"}
          events={{
            url: calUrl,
            format: "ics",
          }}
        />
      )}
      <footer className={styles.footer}>
        <a href="https://github.com/hnspn/cal-udem">github</a>
        @Abderahmane Bouziane
      </footer>
    </div>
  );
}
