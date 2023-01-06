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
const target_semester = "Hiver 2023";

function calendarURL(semester, classes) {
  const base_url = "/api/get_calendar";

  const params = new URLSearchParams();
  params.set("classes", classes);
  params.set("semester", semester);

  const url = `${base_url}?${params.toString()}`;
  return url;
}

const semesters = ["Hiver 2023", "Automne 2022", "Hiver 2022"];

export default function Home() {
  const [semester, setSemester] = useQueryParam(
    "semester",
    withDefault(StringParam, target_semester)
  );
  const [classes, setClasses] = useQueryParam(
    "classes",
    withDefault(ArrayParam, [])
  );

  const [calUrl, setCalUrl] = useState(calendarURL(semester, classes));

  useEffect(() => {
    setCalUrl(calendarURL(semester, classes));
  }, [classes]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Calendier udem</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Calendrier udem</h1>
        <form autoComplete="off">
          <div>
            <input
              type="text"
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  setSemester(e.target.value);
                }
              }}
              id="myInput"
              name="semester"
              placeholder="Session"
            />
          </div>
        </form>
        <input />
        {semester}

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

        <button>generer</button>

        <a href={calendarURL(target_semester, classes)} download="calendar.ics">
          exporter en .ics
        </a>
      </main>

      {classes && (
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
