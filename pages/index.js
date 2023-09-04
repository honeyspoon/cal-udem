import Head from 'next/head';

import debounce from 'lodash.debounce';
import { useQueryParam, JsonParam, withDefault } from 'use-query-params';

import React, { useEffect, useState } from 'react';

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import iCalendarPlugin from '@fullcalendar/icalendar';
import frLocale from '@fullcalendar/core/locales/fr';
import { COURSE_REGEX } from '../patterns';
import Image from 'next/image';

const initialDate = '2023-09-11';

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function entriesFromClassData(classes) {
  const entries = [];
  Object.values(classes).forEach((e) =>
    Object.entries(e.groups).forEach(([k, v]) => {
      if (v) {
        entries.push(e.short_name + ' ' + k);
      }
    }),
  );

  return entries;
}

function calendarURL(entries) {
  const base_url = '/api/get_calendar';

  const params = new URLSearchParams();
  params.set('entries', entries);

  const url = `${base_url}?${params.toString()}`;
  return url;
}

function Search({ onSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [results, setResults] = useState([]);

  async function searchFromCourse(course) {
    const fcourse = course.toLowerCase().replace(" ", "-");
    const res = await fetch(`/api/get_class_data?class_name=${fcourse}`);
    if (res.ok) return [await res.json()];
    return false;
  }

  async function searchFromNothing(search) {
    const res = await fetch(`/api/search?term=${search}`);
    if (res.ok) return await res.json();
    return false;
  }

  async function handleSearch(search) {
    setIsLoading(true);

    let match;
    if (search.trim() == '') {
      setResults([]);
    } else if ((match = search.match(COURSE_REGEX))) {
      const data = await searchFromCourse(match[0]);
      if (data) {
        setResults(data);
      } else {
        setError('error');
      }
    } else {
      const data = await searchFromNothing(search);
      if (data) {
        setResults(data);
      } else {
        setError(error);
      }
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="relative w-full">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500 "
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
          className={
            `bg-gray-50 
          border 
          border-gray-300
          text-gray-900 
          text-sm 
          rounded-lg 
          focus:outline-none
          focus:ring-${error ? 'red' : 'blue'}-500
          focus:border-${error ? 'red' : 'blue'}-500 
          block 
          w-full 
          pl-10 p-2.5`}
          placeholder="Recherche"
          required
          onInput={debounce((e) => {
            handleSearch(e.target.value);
          }, 1000)}
        />
      </div>

      <div
        className={`w-full my-3 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow ${results.length ? '' : 'hidden'}`}
      >
        <ul
          className="p-3 space-y-1 text-sm text-gray-700"
          aria-labelledby="dropdownRadioHelperButton"
        >
          <li>
            {isLoading ? (
              <div className="flex p-2 rounded hover:bg-gray-100">
                <div className="ml-2 text-sm">
                  <Spinner />
                </div>
              </div>
            ) : (
              ''
            )}
          </li>
          {results.map((e, i) => (
            <li key={`search-result-${i}`}>
              <div className="flex p-2 rounded hover:bg-gray-100">
                <div className="ml-2 text-sm">
                  <label
                    htmlFor="helper-radio-4"
                  >
                    <span
                      className="font-medium  text-gray-900 "
                    >
                      {e.short_name.toUpperCase().replace("-", " ")}
                    </span>
                    <button
                      className="
                        mr-0
                        ml-2
                        my-1
                        bg-green-500
                        hover:bg-green-700
                        text-white font-bold 
                        py-0 px-1.5
                        border border-green-500 rounded-full"
                      onClick={() => {
                        onSelect(e);
                      }}
                    >
                      +
                    </button>
                    <p className="text-xs font-normal text-gray-500 ">
                      {e.long_name}
                    </p>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [classes, setClasses] = useQueryParam(
    'classes',
    withDefault(JsonParam, {}),
  );

  const [calUrl, setCalUrl] = useState(calendarURL(classes));

  const entries = entriesFromClassData(classes);

  useEffect(() => {
    setCalUrl(calendarURL(entries));
  }, [entries.length]);

  function toggleEntry(className, groupKey) {
    setClasses((classes) => {
      const newClasses = { ...classes };
      newClasses[className].groups[groupKey] =
        !classes[className].groups[groupKey];
      return newClasses;
    });
  }

  async function addClass(newClass) {
    const data = { ...newClass };
    data.groups = Object.fromEntries(
      data.groups.map((k) => [k, false]),
    );

    setClasses((classes) => ({ ...classes, [newClass.short_name]: data }));
    setIsLoading(false);
  }

  function removeClass(className) {
    setClasses(prev => {
      const o = { ...prev };
      delete o[className];
      return o;
    });
  }

  return (
    <div className="px-2">
      <Head>
        <title>Calendier udem</title>
        <meta
          name="description"
          content=""
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>
      <main className="py-10 flex flex-1 flex-col justify-center items-center">
        <h1 className="text-center text-gray my-2 leading-5 text-5xl">Calendrier UDEM</h1>

        <div className="mt-4 max-w-2xl mx-auto">
          <label className="block mb-2 text-sm font-medium text-gray-900 ">
            1. Ajouter les sigles des cours | [PHY 1620] [MAT 2050]
          </label>
          <Search
            onSelect={(e) => {
              addClass(e);
            }}
          />
        </div>

        {isLoading ? <Spinner /> : ''}
        <h3 className="block my-2 text-sm font-medium text-gray-900 ">
          2. Choisisser les groupes theoriques et pratiques
        </h3>
        <div className="mt-4 px-4 sm:px-8 max-w-5xl m-auto">
          <table className="table-auto border border-gray-200 rounded overflow-hidden shadow-md">
            {Object.values(classes).map((classData, i) => (
              <tr
                key={`li-${i}`}
                className="px-4 py-1 bg-white hover:bg-sky-100 hover:text-sky-900 border-b last:border-none border-gray-200 transition-all duration-300 ease-in-out"
              >
                <td className="text-xs font-bold uppercase">
                  {classData.short_name}
                </td>
                <td className="text-xs text-left">
                  {classData.long_name}
                </td>

                <td
                  className="rounded-md shadow-sm"
                  role="group"
                >
                  {Object.entries(classData.groups).map(
                    ([groupKey, isSelected], i) => (
                      <label
                        className="relative inline-flex items-center my-1 mx-1 cursor-pointer"
                        key={`groupButton_${i}`}
                      >
                        <input
                          type="checkbox"
                          onChange={() => {
                            toggleEntry(classData.short_name, groupKey);
                          }}
                          checked={isSelected}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 ">
                          {groupKey}
                        </span>
                      </label>
                    ),
                  )}
                </td>

                <td>
                  <button
                    className="mr-0 ml-3 bg-red-500 hover:bg-red-700 text-white font-bold py-0 px-2 border border-red-500 rounded-full"
                    onClick={() => {
                      removeClass(classData.short_name)
                    }}
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </table>
        </div>

        <a
          className="mt-5 px-4 py-1 text-sm hover:text-purple-600 hover:bg-white font-semibold rounded border border-purple-200 text-white bg-purple-600 border-transparent hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          href={calUrl}
          download="calendar.ics"
        >
          3. Exporter en .ics
        </a>

        <a
          className="mt-2 text-sm font-medium text-blue-600 hover:underline "
          href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop"
        >
          Comment utiliser le .ics?
        </a>
      </main>

      <div className="lg:w-4/5 w-full m-auto">
        {entries.length != 0 && (
          <FullCalendar
            plugins={[timeGridPlugin, iCalendarPlugin]}
            initialView="timeGridWeek"
            locales={frLocale}
            locale="fr"
            weekends={false}
            initialDate={initialDate}
            slotMinTime={'08:00:00'}
            allDaySlot={false}
            headerToolbar={{
              start: 'title',
              center: '',
              end: 'prev,next',
            }}
            contentHeight={600}
            events={{
              url: calUrl,
              format: 'ics',
            }}
          />
        )}
      </div>

      <Footer />
    </div >
  );
}

function Footer() {
  return (
    <div className="max-w-2xl mx-auto">
      <footer className="p-4 bg-white sm:p-6 ">
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center ">
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
                src="https://www.paypalobjects.com/fr_CA/i/btn/btn_donate_SM.gif"
                border="0"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Bouton Faire un don avec PayPal"
              />
              <Image
                alt=""
                border="0"
                src="https://www.paypal.com/fr_CA/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
