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
const semesters = [
  // "Automne 2022",
  // "Hiver 2022"
  "Hiver 2023",
];

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
        <h1 className={styles.title}>Calendrier UDEM</h1>
        <h2>beta</h2>

        <div className="max-w-2xl mx-auto">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
            Choisir une session
          </label>
          <select
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => {
              setSemester(e.target.value);
            }}
          >
            {semesters.map((s, i) => (
              <option key={i}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 max-w-2xl mx-auto">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
            Ajouter des cours tels qu&lsquo;indiqué sur le centre etudiant. Ex:
            [PHY 1620-A1] [MAT 2050-A]
          </label>
          <div className="relative w-full">
            <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              type="text"
              id="simple-search"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Recherche"
              required
              onKeyUp={(e) => {
                if (e.key == "Enter") {
                  const s = new Set(classes);
                  s.add(e.target.value);
                  setClasses(Array.from(s));
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>

        <div className="mt-4 px-4 sm:px-8 max-w-5xl m-auto">
          <ul className="border border-gray-200 rounded overflow-hidden shadow-md">
            {Array.from(classes).map((e, i) => (
              <li
                key={`li-${i}`}
                className=" flex items-center  px-4 py-1 bg-white hover:bg-sky-100 hover:text-sky-900 border-b last:border-none border-gray-200 transition-all duration-300 ease-in-out"
              >
                <span className="flex-1 text-xs flex-shrink-0">{e}</span>
                <button
                  className="mr-0 ml-3 bg-red-500 hover:bg-red-700 text-white font-bold py-0 px-2 border border-red-500 rounded-full"
                  onClick={() => {
                    const s = new Set(classes);
                    s.delete(e);
                    setClasses(Array.from(s));
                  }}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
        </div>

        <a
          className="mt-5 px-4 py-1 text-sm hover:text-purple-600 hover:bg-white font-semibold rounded border border-purple-200 text-white bg-purple-600 border-transparent hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          href={calendarURL(semester, classes)}
          download="calendar.ics"
        >
          Exporter en .ics
        </a>

        <a
          className="mt-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
          href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop"
        >
          Comment utiliser le .ics?
        </a>
      </main>

      {classes.length > 0 && (
        <FullCalendar
          plugins={[timeGridPlugin, iCalendarPlugin]}
          initialView="timeGridWeek"
          locales={frLocale}
          locale="fr"
          weekends={false}
          initialDate={initialDate}
          slotMinTime={"08:00:00"}
          allDaySlot={false}
          headerToolbar={{
            start: "title",
            center: "",
            end: "prev,next",
          }}
          contentHeight={400}
          events={{
            url: calUrl,
            format: "ics",
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="max-w-2xl mx-auto">
      <footer className="p-4 bg-white sm:p-6 ">
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023 Abderahmane Bouziane
          </span>
          <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
            <form
              action="https://www.paypal.com/donate"
              method="post"
              target="_top"
            >
              <input
                type="hidden"
                name="hosted_button_id"
                value="K7SBBRXE3W3NA"
              />
              <input
                type="image"
                src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif"
                border="0"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Donate with PayPal button"
              />

              <img
                alt=""
                border="0"
                src="https://www.paypal.com/en_CA/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </form>

            <a
              href="https://www.instagram.com/_honeyspoon/"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
            <a
              href="https://github.com/hnspn/cal-udem"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
