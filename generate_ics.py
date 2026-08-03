#!/usr/bin/env python3
"""Generate menu.ics (iCalendar) from menu.json.

Creates one all-day event per menu day so families can subscribe to the
calendar from Google Calendar (or any app) and see the daily menu.
Runs locally and in GitHub Actions on every push that changes menu.json.
"""

import json
from datetime import datetime, timezone

SRC = "menu.json"
OUT = "menu.ics"
UID_DOMAIN = "menu-comedor-sanroman"


def escape(text):
    """Escape a value for an iCalendar TEXT field."""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def fold(line):
    """Fold a content line to <=75 octets per RFC 5545 (continuation = space)."""
    raw = line.encode("utf-8")
    if len(raw) <= 75:
        return line
    out = []
    while len(raw) > 75:
        # Avoid splitting in the middle of a multibyte character.
        cut = 75
        while cut > 0 and (raw[cut] & 0xC0) == 0x80:
            cut -= 1
        out.append(raw[:cut])
        raw = raw[cut:]
    out.append(raw)
    return b"\r\n ".join(out).decode("utf-8")


def next_day(datestr):
    """Return YYYYMMDD for the day after the given YYYYMMDD (all-day DTEND)."""
    y, m, d = int(datestr[:4]), int(datestr[4:6]), int(datestr[6:8])
    from datetime import date, timedelta

    return (date(y, m, d) + timedelta(days=1)).strftime("%Y%m%d")


def main():
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)

    cal_name = data.get("colegio", "Menú del Comedor")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//menu-comedor//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{escape(cal_name)}",
        "X-WR-TIMEZONE:America/Argentina/Buenos_Aires",
        "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
        "X-PUBLISHED-TTL:PT12H",
    ]

    for month_key in sorted(data.get("meses", {})):
        year, month = month_key.split("-")
        days = data["meses"][month_key]
        for day in sorted(days, key=int):
            dishes = days[day]
            if not dishes:
                continue
            datestr = f"{year}{month}{int(day):02d}"
            summary = dishes[0]
            if not summary.startswith(("🍽", "🎉")) and summary != "Feriado":
                summary = "🍽️ " + summary
            description = "\n".join(dishes)
            lines += [
                "BEGIN:VEVENT",
                f"UID:{datestr}@{UID_DOMAIN}",
                f"DTSTAMP:{stamp}",
                f"DTSTART;VALUE=DATE:{datestr}",
                f"DTEND;VALUE=DATE:{next_day(datestr)}",
                fold(f"SUMMARY:{escape(summary)}"),
                fold(f"DESCRIPTION:{escape(description)}"),
                "TRANSP:TRANSPARENT",
                "END:VEVENT",
            ]

    lines.append("END:VCALENDAR")

    with open(OUT, "w", encoding="utf-8", newline="") as f:
        f.write("\r\n".join(lines) + "\r\n")

    print(f"Wrote {OUT} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
