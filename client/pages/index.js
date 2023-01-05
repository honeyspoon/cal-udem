import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";

import FullCalendar from "@fullcalendar/react"; // must go before plugins
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";

export default function Home() {
  const [classes, setClasses] = useState(new Set());

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
              console.log(s);
              setClasses(s);
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
                setClasses(s);
              }}
            >
              X
            </button>
          </div>
        ))}
        <button>generer</button>
      </main>
      <FullCalendar
        plugins={[timeGridPlugin, iCalendarPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        events={{
          url: "/api/hello",
          format: "ics",
        }}
      />
      <footer className={styles.footer}></footer>
    </div>
  );
}
