import datetime

import bs4
import ics
import requests
import pytz


def parse_dates(date_str):
    _, start_date, _, end_date = date_str.split()
    start_date = datetime.datetime.strptime(start_date, "%d/%m/%Y").astimezone(pytz.UTC)
    end_date = datetime.datetime.strptime(end_date, "%d/%m/%Y").astimezone(pytz.UTC)

    return start_date, end_date


def parse_times(time_str):
    _, s_hour, _, s_min, _, e_hour, _, e_min = time_str.split()
    start_time = datetime.time(int(s_hour), int(s_min))
    end_time = datetime.time(int(e_hour), int(e_min))
    return start_time, end_time


def parse_weekday(weekday):
    d = {
        "Lundi": 0,
        "Mardi": 1,
        "Mercredi": 2,
        "Jeudi": 3,
        "Vendredi": 4,
        "Samedi": 5,
        "Dimanche": 6,
    }
    return d[weekday]


def get_schedule(class_name):
    schedule = {}

    # url = f"https://admission.umontreal.ca/cours-et-horaires/cours/{class_name}/"
    # result = requests.get(url)
    # if result:

    if True:
        with open("a.html") as f:
            data = f.read()
            soup = bs4.BeautifulSoup(data, "html.parser")

            long_name = soup.find("h1", {"class": "featuredTitle"}).get_text()
            schedule_section = soup.find("section", {"class": "horaire-folder"})
            semesters = schedule_section.find_all("div", {"class": "fold"})

            for semester in semesters:
                semester_name = (
                    semester.find("span", {"class": "foldButton"}).get_text().strip()
                )
                sections = [
                    section.get_text().strip() for section in semester.find_all("h4")
                ]
                tables = semester.find_all("table")
                schedule[semester_name] = {}
                for section, table in zip(sections, tables):
                    entries = [
                        [cell.get_text().strip() for cell in row.find_all("td")]
                        for row in table.find_all("tr")[1:]
                    ]
                    schedule[semester_name][section] = []
                    for day, hours, dates in entries:
                        start_date, end_date = parse_dates(dates)
                        start_time, end_time = parse_times(hours)
                        schedule[semester_name][section].append(
                            [
                                start_date,
                                end_date,
                                start_time,
                                end_time,
                            ]
                        )

    return schedule


def main():
    c = ics.Calendar()

    class_name = "mat-1000"
    schedule = get_schedule(class_name)
    for semester_name, semester in schedule.items():
        for section, hours in semester.items():
            for entry in hours:
                start_date, end_date, start_time, end_time = entry
                e = ics.Event()
                e.summary = section
                e.description = "A meaningful description"

                real_start_datetime = datetime.datetime.combine(start_date, start_time)
                real_end_datetime = datetime.datetime.combine(start_date, end_time)

                e.begin = real_start_datetime
                e.end = real_end_datetime

                c.events.append(e)

    with open("my.ics", "w") as my_file:
        my_file.writelines(c.serialize())


if __name__ == "__main__":
    main()
