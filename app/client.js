'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { produce } from 'immer';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SEMESTER } from './const';

import {
  Input,
  Tooltip,
  Listbox,
  ListboxItem,
  Spinner,
  CheckboxGroup,
  Checkbox,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Link,
} from '@nextui-org/react';

import { AiOutlineSearch, AiFillDelete } from 'react-icons/ai';

import frLocale from '@fullcalendar/core/locales/fr';
import iCalendarPlugin from '@fullcalendar/icalendar';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';

import debounce from 'lodash.debounce';

import { COURSE_REGEX } from 'app/patterns';

const initialDate = new Date();

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

  return `${base_url}?${params.toString()}`;
}

function Search({ onSelect }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [results, setResults] = useState([]);

  function clearResults() {
    setResults([]);
  }

  async function searchFromCourse(course) {
    const fcourse = course.toLowerCase().replace(' ', '-');
    const res = await fetch(`/api/get_class_data/${fcourse}`);
    if (res.ok) return [await res.json()];
    return false;
  }

  async function searchFromNothing(search) {
    const res = await fetch(`/api/search/${search}`);
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
      <Input
        label="Recherche"
        aria-label="recherche de cours"
        isClearable
        radius="lg"
        classNames={{
          label: 'text-black/50',
          inputWrapper: [
            'shadow-xl',
            'bg-default-200/50',
            'backdrop-blur-xl',
            'backdrop-saturate-200',
            'hover:bg-default-200/70',
            'group-data-[focused=true]:bg-default-200/50',
            '!cursor-text',
          ],
        }}
        placeholder=""
        startContent={
          <AiOutlineSearch
            className="
            text-black/50 text-slate-400 
            pointer-events-none 
            flex-shrink-0 
            "
          />
        }
        onClear={clearResults}
        onInput={(e) => {
          clearResults();
          debounce(() => {
            handleSearch(e.target.value);
          }, 1000)();
        }}
      />

      {isLoading && (
        <div
          className="
            justify-center items-center flex
            p-2 my-10
            rounded
          "
        >
          <Spinner />
        </div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center items-center"
        >
          <div
            className="
              w-11/12
              px-1 py-2 mt-2
              border-small rounded-small border-default-200 dark:border-default-100
            "
          >
            <Listbox aria-label="bb">
              {results.map((e, i) => (
                <ListboxItem
                  key={i}
                  textValue={e.short_name}
                  onClick={() => onSelect(e)}
                  onBlur={(e) => {
                    if (e.relatedTarget?.nodeName != 'LI') {
                      clearResults();
                    }
                  }}
                >
                  <span
                    className="
                    pl-2
                    "
                  >
                    {e.short_name.toUpperCase().replace('-', ' ')}
                  </span>
                  <span
                    className="
                    pl-2
                    "
                  >
                    {e.long_name}
                  </span>
                </ListboxItem>
              ))}
            </Listbox>
          </div>
        </motion.div>
      )}
    </>
  );
}

function classUrl(shortName) {
  return `https://admission.umontreal.ca/cours-et-horaires/cours/${shortName}/`;
}

export function Client({ defaultClasses }) {
  const router = useRouter();

  const [classes, setClasses] = useState(defaultClasses);
  const [calUrl, setCalUrl] = useState();

  const entries = entriesFromClassData(classes);

  useEffect(() => {
    if (entries.length > 0) {
      setCalUrl(calendarURL(entries));
    } else {
      setCalUrl(null);
    }
  }, [entries.length]);

  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('classes', JSON.stringify(classes));
    router.replace(url.toString(), '', { shallow: true });
  }, [classes]);

  function setGroups(className, groups) {
    setClasses((classes) =>
      produce(classes, (draft) => {
        for (let group of Object.keys(draft[className].groups)) {
          draft[className].groups[group] = groups.includes(group);
        }
      }),
    );
  }

  function removeClass(className) {
    setClasses((prev) =>
      produce(prev, (draft) => {
        delete draft[className];
      }),
    );
  }

  function addClass(newClass) {
    setClasses((classes) =>
      produce(classes, (draft) => {
        const c = produce(newClass, (cDraft) => {
          cDraft.groups = Object.fromEntries(cDraft.groups.map((g) => [g, false]));
          delete cDraft.url;
        });
        draft[newClass.short_name] = c;
      }),
    );
  }

  return (
    <div className="">
      <main
        className="
        flex flex-1 flex-col justify-center items-center
        "
      >
        <h2
          className="
          text-center text-gray leading-5 text-2xl
          "
        >
          {SEMESTER}
        </h2>

        <div
          className="
          max-w-2xl 
          mt-4 mx-auto
          "
        >
          <label
            className="
            block 
            mb-2 
            text-sm font-medium text-gray-900
            "
          >
            1. Ajoutez les sigles des cours | [PHY 1620] [MAT 2050]
          </label>
          <Search onSelect={addClass} />
        </div>

        {Object.keys(classes).length > 0 && (
          <>
            <h3
              className="
              block
              mt-4
              text-sm font-medium text-gray-900
              "
            >
              2. Choisisser les groupes theoriques et pratiques
            </h3>

            <div
              className="
              flex justify-center items-center
              mt-2 px-4
              "
            >
              <Table
                hideHeader
                aria-label="classes table"
              >
                <TableHeader>
                  <TableColumn>short name</TableColumn>
                  <TableColumn>long name</TableColumn>
                  <TableColumn>groups</TableColumn>
                  <TableColumn>delete</TableColumn>
                </TableHeader>
                <TableBody items={Object.values(classes)}>
                  {(classData) => (
                    <TableRow key={classData.short_name}>
                      <TableCell className="font-bold">
                        {classData.short_name.toUpperCase().replace('-', ' ')}
                      </TableCell>

                      <TableCell>
                        <Link
                          target="_blank"
                          href={classUrl(classData.short_name)}
                        >
                          {classData.long_name}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <CheckboxGroup
                          orientation="horizontal"
                          color="secondary"
                          defaultValue={Object.entries(classData.groups)
                            .filter(([, v]) => v)
                            .map(([g]) => g)}
                          onChange={(selectedGroups) => {
                            setGroups(classData.short_name, selectedGroups);
                          }}
                          items={Object.keys(classData.groups)}
                        >
                          {Object.keys(classData.groups).map((groupKey) => (
                            <Checkbox
                              key={`${classData.short_name}-${groupKey}`}
                              value={groupKey}
                            >
                              {groupKey}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                      </TableCell>

                      <TableCell>
                        <Tooltip content="retirer">
                          <span
                            onClick={() => {
                              removeClass(classData.short_name);
                            }}
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                          >
                            <AiFillDelete />
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {calUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <a
              className="
              block
              mt-5 px-4 py-1 
              text-sm hover:text-purple-600 hover:bg-white font-semibold text-white 
              bg-purple-600 
              rounded border border-purple-200 border-transparent hover:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2
              "
              href={calUrl}
              download="calendar.ics"
            >
              3. Exporter en .ics
            </a>

            <a
              className="
              block
              mt-2
              text-sm font-medium text-blue-600 hover:underline
              "
              target="_blank"
              href="https://support.google.com/calendar/answer/37118?hl=en&co=GENIE.Platform%3DDesktop"
              rel="noreferrer"
            >
              Comment utiliser le .ics?
            </a>
          </motion.div>
        )}
      </main>
      {calUrl && <CalendarWrapper calUrl={calUrl} />}
    </div>
  );
}

export function CalendarWrapper({ calUrl }) {
  const [isLoading, setIsLoading] = useState(false);
  const set = useCallback((e) => {
    setIsLoading(e);
  }, []);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="
          lg:w-4/5 w-full 
          m-auto
        "
      >
        {isLoading && (
          <div
            className="
            inset-0 absolute
            justify-center items-center flex
            p-2 my-10
            bg-white/30
            w-full
            h-full
            z-10
            backdrop-blur-xl
          "
          >
            <Spinner />
          </div>
        )}
        <Calendar
          calUrl={calUrl}
          setIsLoading={set}
        />
      </motion.div>
    </>
  );
}

const Calendar = memo(function Calendar({ calUrl, setIsLoading }) {
  return (
    <>
      <FullCalendar
        plugins={[timeGridPlugin, iCalendarPlugin]}
        initialView="timeGridWeek"
        locales={frLocale}
        locale="fr"
        weekends={false}
        initialDate={initialDate}
        slotMinTime={'08:00:00'}
        allDaySlot={false}
        nowIndicator
        headerToolbar={{
          start: 'title',
          center: '',
          end: 'prev,next',
        }}
        loading={setIsLoading}
        contentHeight={600}
        events={{
          url: calUrl,
          format: 'ics',
        }}
      />
    </>
  );
});
