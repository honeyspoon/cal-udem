import Head from "next/head";

import debounce from 'lodash.debounce';
import styles from "../styles/Home.module.css";
import {
  useQueryParam,
  ArrayParam,
  withDefault,
} from "use-query-params";

import React, { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import frLocale from "@fullcalendar/core/locales/fr";
import { LECTURE_REGEX, UDEM_COURSE_URL_REGEX, TP_REGEX } from "../patterns";
import Image from "next/image";

const initialDate = "2023-09-04";


function calendarURL(classes) {
  const base_url = "/api/get_calendar";

  const params = new URLSearchParams();
  params.set("classes", classes);

  const url = `${base_url}?${params.toString()}`;
  return url;
}


function searchFromLecture(lecture) {
  return [];
}

function searchFromTP(tp) {
  return [];
}

async function searchFromURL(course) {
  await fetch(`/api/search/url?`)
  return [];
}

async function searchFromNothing(search) {
  const res = await fetch(`/api/search?term=${search}`)
  return await res.json();
}

function Search({ onSelect }) {
  const [results, setResults] = useState([]);

  function handleSearch(search) {
    console.log('handle search')
    if (search == '') {
      setResults([]);
      return
    }

    let match;
    if (match = search.match(TP_REGEX)) {
      const [_, subject, number, group] = match;
      console.log("matched a tp", match)
      setResults(searchFromTP({ subject, number, group }))
      return
    }

    if (match = search.match(LECTURE_REGEX)) {
      const [_, subject, number, group] = match;
      console.log("matched a lecture", match)
      setResults(searchFromLecture({ subject, number, group }))
      return;
    }

    if (match = search.match(UDEM_COURSE_URL_REGEX)) {
      const [url, course] = match;
      console.log("matched a url", url, course)
      setResults(searchFromURL(course))
      return;
    }

    console.log('no pattern matched')
    searchFromNothing(search).then((data) => {
      setResults(data)
    })
  }

  return (
    <>
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
          onInput={debounce((e) => { handleSearch(e.target.value) }, 1000)}
          onKeyUp={(e) => {
            if (e.key == "Enter") {
              onSelect(e.target.value);
            }
          }}
        />
      </div>

      <div className={`w-full my-3 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 ${results.length ? '' : 'hidden'}`}>
        <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioHelperButton">
          {results.map((e, i) =>
            <li key={`search-result-${i}`}>
              <div className="flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                <div className="ml-2 text-sm">
                  <label htmlFor="helper-radio-4" className="font-medium text-gray-900 dark:text-gray-300">

                    <div>{e}
                      <button
                        className="mr-0 ml-3 bg-green-500 hover:bg-green-700 text-white font-bold py-0 px-2 border border-green-500 rounded-full"
                        onClick={() => {
                          onSelect(e)
                        }}
                      >
                        +
                      </button>
                    </div>
                    <p id="helper-radio-text-4" className="text-xs font-normal text-gray-500 dark:text-gray-300">Some helpful instruction goes over here.</p>
                  </label>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  )
}

export default function Home() {
  const [classes, setClasses] = useQueryParam(
    "classes",
    withDefault(ArrayParam, [])
  );

  const [calUrl, setCalUrl] = useState(calendarURL(classes));

  useEffect(() => {
    setCalUrl(calendarURL(classes));
  }, [classes]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Calendier udem</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Calendrier UDEM</h1>

        <div className="mt-4 max-w-2xl mx-auto">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
            Ajouter des cours tels qu&lsquo;indiqué sur le centre etudiant. Ex:
            [PHY 1620-A1] [MAT 2050-A]
          </label>
          <Search onSelect={(e) => { console.log(e) }} />
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
          href={calendarURL(classes)}
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
      </main >

      {
        classes.length > 0 && (
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
        )
      }

      < Footer />
    </div >
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
            <form action="https://www.paypal.com/donate" method="post" target="_top">
              <input type="hidden" name="hosted_button_id" value="K7SBBRXE3W3NA" />
              <input type="image" src="https://www.paypalobjects.com/fr_CA/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Bouton Faire un don avec PayPal" />
              <img alt="" border="0" src="https://www.paypal.com/fr_CA/i/scr/pixel.gif" width="1" height="1" />
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
