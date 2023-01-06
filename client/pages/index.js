import Head from "next/head";

import styles from "../styles/Home.module.css";
import { useQueryParam, ArrayParam, withDefault } from "use-query-params";

import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";

const initialDate = Date.parse("2023-01-09");

function classesToUrl(classes) {
  const base_url = "/api/get_calendar";

  const params = new URLSearchParams();
  params.set("classes", classes);

  return `${base_url}?${params.toString()}`;
}

export default function Home() {
  const [classes, setClasses] = useQueryParam(
    "classes",
    withDefault(ArrayParam, [])
  );

  const [calUrl, setCalUrl] = useState(classesToUrl(classes));

  useEffect(() => {
    setCalUrl(classesToUrl(classes));
    console.log("change in classes", classes);
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

        <button
          onClick={() => {
            console.log("hey");
          }}
        >
          exporter en .ics
        </button>
      </main>

      {classes && (
        <FullCalendar
          plugins={[timeGridPlugin, iCalendarPlugin]}
          initialView="timeGridWeek"
          weekends={false}
          initialDate={initialDate}
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
