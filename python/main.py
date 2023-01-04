import argparse
import datetime
import functools
import os
import pickle

import bs4
import ics
import requests


def parse_dates(date_str):
    _, start_date, _, end_date = date_str.split()
    start_date = datetime.datetime.strptime(start_date, "%d/%m/%Y")
    end_date = datetime.datetime.strptime(end_date, "%d/%m/%Y")

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


def parse_class_name(class_name):
    name, section = class_name.split("-")
    name = name.lower()
    name = name.replace(" ", "-")

    return name, section


def class_url(class_name):
    return f"https://admission.umontreal.ca/cours-et-horaires/cours/{class_name}/"


@functools.lru_cache()
def get_schedule(class_name):
    schedule = {}

    CACHE_INVALIDATION_THRES_S = 60 * 60
    file_name = f"{class_name}.pickle"
    if (
        os.path.exists(file_name)
        and datetime.datetime.now().timestamp() - os.path.getmtime(file_name)
        < CACHE_INVALIDATION_THRES_S
    ):
        f = open(file_name, "rb")
        schedule = pickle.load(f)
    else:
        f = open(file_name, "wb")

        url = class_url(class_name)
        result = requests.get(url)
        if result:
            if True:
                data = result.text
                soup = bs4.BeautifulSoup(data, "html.parser")

                long_name = soup.find("h1", {"class": "featuredTitle"}).get_text()
                schedule_section = soup.find("section", {"class": "horaire-folder"})
                semesters = schedule_section.find_all("div", {"class": "fold"})

                for semester in semesters:
                    semester_name = (
                        semester.find("span", {"class": "foldButton"})
                        .get_text()
                        .strip()
                    )
                    sections = [
                        section.get_text().strip().split(" ")[-1]
                        for section in semester.find_all("h4")
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
                            schedule["long_name"] = long_name
                            schedule[semester_name][section].append(
                                [
                                    start_date,
                                    end_date,
                                    start_time,
                                    end_time,
                                ]
                            )

        pickle.dump(schedule, f)

    return schedule


def main(args):
    request = {
        "classes": [
            "MAT 1410-A",
            "MAT 1410-A101",
            "MAT 2050-A",
            "MAT 2050-A101",
            "PHY 1441-A",
            "PHY 1441-A1",
            "PHY 1620-A",
            "PHY 1620-A1",
            "PHY 1652-A",
            "PHY 1652-A1",
        ],
        "semester": "Hiver 2023",
    }
    cal_file_name = args.out_file

    c = ics.Calendar()
    for long_name in request["classes"]:

        class_name, target_section = parse_class_name(long_name)
        schedule = get_schedule(class_name)
        for semester_name, semester in schedule.items():
            if semester_name != request["semester"]:
                continue
            for section, hours in semester.items():
                if section != target_section:
                    continue

                for entry in hours:
                    start_date, end_date, start_time, end_time = entry

                    e = ics.Event()
                    e.summary = long_name
                    e.description = "A meaningful description"

                    real_start_datetime = datetime.datetime.combine(
                        start_date, start_time
                    )
                    real_end_datetime = datetime.datetime.combine(start_date, end_time)

                    e.begin = real_start_datetime
                    e.end = real_end_datetime
                    count = (end_date - start_date).days // 7 + 1
                    line = [f"RRULE:FREQ=WEEKLY;INTERVAL=1;COUNT={count}"]
                    e.extra = ics.Container(
                        name="VEVENT", data=[ics.contentline.lines_to_container(line)]
                    )

                    c.events.append(e)

    with open(cal_file_name, "w") as my_file:
        my_file.writelines(c.serialize())


def parse_args():
    parser = argparse.ArgumentParser()
    # parser.add_argument("request_file")
    # parser.add_argument("out-file")

    args = parser.parse_args()
    args.out_file = "my_cal.ics"

    return args


if __name__ == "__main__":
    args = parse_args()
    main(args)
