import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import ArrowRightIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowRight";
import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import PageLayout from "../components/PageLayout.js";
import meetingsData from "../data/meetings.json";
import type { Meeting } from "../types/meetings";

type CalendarView = "year" | "month" | "week" | "day";

const MEETINGS = meetingsData.meetings as Meeting[];

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const HOUR_START = 7;
const HOUR_END = 21;
const HOUR_HEIGHT = 64; // px per hour


function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseTimeHours(timeStr: string): number {
  const m = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return 9;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const p = m[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h + min / 60;
}

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const timeGridRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef(0);

  useEffect(() => {
    if (view === "week" || view === "day") {
      requestAnimationFrame(() => {
        if (timeGridRef.current) {
          timeGridRef.current.scrollTop = scrollTargetRef.current;
        }
      });
    }
  }, [view, currentDate]);

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of MEETINGS) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date)!.push(m);
    }
    return map;
  }, []);

  const todayStr = toDateStr(new Date());
  const divider = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  function getMeetings(ds: string): Meeting[] {
    return meetingsByDate.get(ds) ?? [];
  }

  function openMeeting(m: Meeting) {
    navigate(`/meetings/${m.id}`);
  }

  function goToPrev() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "year") d.setFullYear(d.getFullYear() - 1);
      else if (view === "month") d.setMonth(d.getMonth() - 1);
      else if (view === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }

  function goToNext() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "year") d.setFullYear(d.getFullYear() + 1);
      else if (view === "month") d.setMonth(d.getMonth() + 1);
      else if (view === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }

  function getTitle(): string {
    if (view === "year") return String(currentDate.getFullYear());
    if (view === "month") return `${MONTHS_FULL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === "week") {
      const ws = startOfWeek(currentDate);
      const we = addDays(ws, 6);
      const sameYear = ws.getFullYear() === we.getFullYear();
      const sameMonth = sameYear && ws.getMonth() === we.getMonth();
      if (sameMonth) return `${MONTHS_FULL[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`;
      if (sameYear) return `${MONTHS_SHORT[ws.getMonth()]} ${ws.getDate()} – ${MONTHS_SHORT[we.getMonth()]} ${we.getDate()}, ${ws.getFullYear()}`;
      return `${MONTHS_SHORT[ws.getMonth()]} ${ws.getDate()}, ${ws.getFullYear()} – ${MONTHS_SHORT[we.getMonth()]} ${we.getDate()}, ${we.getFullYear()}`;
    }
    return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  // ── YEAR VIEW ─────────────────────────────────────────────────────────────
  function renderYearView() {
    const year = currentDate.getFullYear();
    const rows = [0, 1, 2]; // 3 rows of 4 months
    return (
      <Box sx={{ border: `1px solid ${divider}`, borderRadius: "12px", overflow: "hidden", bgcolor: "#ffffff" }}>
        {rows.map((row) => (
          <Box
            key={row}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderBottom: row < 2 ? `1px solid ${divider}` : "none",
            }}
          >
            {[0, 1, 2, 3].map((col) => {
              const mi = row * 4 + col;
              const firstDow = (new Date(year, mi, 1).getDay() + 6) % 7;
              const daysInMonth = new Date(year, mi + 1, 0).getDate();
              const cells: (number | null)[] = Array(firstDow).fill(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);

              return (
                <Box
                  key={mi}
                  sx={{
                    borderLeft: col > 0 ? `1px solid ${divider}` : "none",
                    p: "16px",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 0.75, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => { setCurrentDate(new Date(year, mi, 1)); setView("month"); }}
                  >
                    {MONTHS_SHORT[mi]}
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {DAYS_SHORT.map((d) => (
                      <Typography
                        key={d}
                        sx={{ textAlign: "center", color: "text.disabled", fontWeight: 700, fontSize: 9, lineHeight: "18px" }}
                      >
                        {d[0]}
                      </Typography>
                    ))}
                    {cells.map((day, i) => {
                      if (day === null) return <Box key={`e-${i}`} sx={{ height: 20 }} />;
                      const ds = `${year}-${String(mi + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const hasMeetings = (meetingsByDate.get(ds)?.length ?? 0) > 0;
                      const isToday = ds === todayStr;
                      return (
                        <Box
                          key={day}
                          onClick={() => { setCurrentDate(new Date(year, mi, day)); setView("day"); }}
                          sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            height: 22, cursor: "pointer", borderRadius: "4px",
                            bgcolor: isToday ? "#0040D5" : hasMeetings ? "#E4F3FF" : "transparent",
                            "&:hover": { bgcolor: isToday ? "#0040D5" : hasMeetings ? "#C8E0F7" : "action.hover" },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 10,
                              fontWeight: hasMeetings || isToday ? 700 : 400,
                              color: isToday ? "#ffffff" : "text.primary",
                            }}
                          >
                            {day}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }

  // ── MONTH VIEW ────────────────────────────────────────────────────────────
  function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevYear = month === 0 ? year - 1 : year;
    const prevMo = month === 0 ? 11 : month - 1;
    const nextYear = month === 11 ? year + 1 : year;
    const nextMo = month === 11 ? 0 : month + 1;

    type Cell = { day: number; dateStr: string; other: boolean };
    const cells: Cell[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({ day: d, dateStr: `${prevYear}-${String(prevMo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, other: false });
    }
    let nd = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nd, dateStr: `${nextYear}-${String(nextMo + 1).padStart(2, "0")}-${String(nd).padStart(2, "0")}`, other: true });
      nd++;
    }

    const weeks: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <Box sx={{ border: `1px solid ${divider}`, borderRadius: "12px", overflow: "hidden", bgcolor: "background.paper" }}>
        {/* Day-of-week header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${divider}`, bgcolor: "var(--lens-component-table-header-background-color)" }}>
          {DAYS_SHORT.map((d) => (
            <Box key={d} sx={{ py: 1, px: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>{d}</Typography>
            </Box>
          ))}
        </Box>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <Box
            key={wi}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              borderBottom: wi < weeks.length - 1 ? `1px solid ${divider}` : "none",
              minHeight: 120,
            }}
          >
            {week.map((cell, ci) => {
              const meetings = getMeetings(cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const MAX = 3;
              const shown = meetings.slice(0, MAX);
              const overflow = meetings.length - MAX;
              return (
                <Box
                  key={ci}
                  sx={{
                    borderLeft: ci > 0 ? `1px solid ${divider}` : "none",
                    p: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    bgcolor: cell.other ? "#FAFAFA" : "#ffffff",
                    outline: isToday ? "2px solid #0040D5" : "none",
                    outlineOffset: "-1px",
                    zIndex: isToday ? 1 : "auto",
                    position: isToday ? "relative" : "static",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    onClick={() => { setCurrentDate(new Date(`${cell.dateStr}T12:00:00`)); setView("day"); }}
                    sx={{ alignSelf: "flex-start", cursor: "pointer" }}
                  >
                    <Typography
                      sx={{
                        width: 26, height: 26,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%",
                        bgcolor: isToday ? "primary.main" : "transparent",
                        color: isToday ? "primary.contrastText" : cell.other ? "#9E9E9E" : "text.primary",
                        fontWeight: isToday ? 700 : 400,
                        fontSize: 13,
                        "&:hover": { bgcolor: isToday ? "primary.dark" : "action.hover" },
                      }}
                    >
                      {cell.day}
                    </Typography>
                  </Box>
                  {shown.map((m) => (
                    <Tooltip key={m.id} title={`${m.name} · ${m.time ?? "Time TBD"} · ${m.committee}`}>
                      <Box
                        onClick={() => openMeeting(m)}
                        sx={{
                          bgcolor: "#E4F3FF",
                          borderRadius: "4px",
                          px: "6px",
                          py: "2px",
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#C8E0F7" },
                          overflow: "hidden",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: "16px",
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {m.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                  {overflow > 0 && (
                    <Typography
                      sx={{ fontSize: 11, color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      onClick={() => { setCurrentDate(new Date(`${cell.dateStr}T12:00:00`)); setView("day"); }}
                    >
                      +{overflow} more
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }

  // ── TIME GRID (week + day) ────────────────────────────────────────────────
  function renderTimeGrid(dates: Date[]) {
    const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
    const totalH = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
    const TIME_W = 56;
    const isMultiDay = dates.length > 1;

    const allDayByCol = dates.map((d) => getMeetings(toDateStr(d)).filter((m) => !m.time));
    const timedByCol = dates.map((d) => getMeetings(toDateStr(d)).filter((m) => !!m.time));
    const hasAllDay = allDayByCol.some((ms) => ms.length > 0);

    // Find the earliest timed meeting to auto-scroll
    const earliestHour = timedByCol.reduce((earliest, meetings) => {
      for (const m of meetings) {
        const h = parseTimeHours(m.time!);
        if (h < earliest) earliest = h;
      }
      return earliest;
    }, 24);
    // Scroll to 1 hour before the earliest meeting, or default to 8 AM
    const scrollToHour = earliestHour < 24 ? Math.max(earliestHour - 1, HOUR_START) : 8;
    const scrollTarget = (scrollToHour - HOUR_START) * HOUR_HEIGHT;
    scrollTargetRef.current = scrollTarget;

    return (
      <Box sx={{ border: `1px solid ${divider}`, borderRadius: "12px", overflow: "hidden", bgcolor: "#ffffff" }}>
        {/* Scrollable time grid */}
        <Box
          ref={timeGridRef}
          sx={{ overflowY: "auto", maxHeight: "calc(100vh - 420px)" }}
        >
          {/* Column headers */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `${TIME_W}px repeat(${dates.length}, 1fr)`,
              borderBottom: `1px solid ${divider}`,
              bgcolor: "var(--lens-component-table-header-background-color)",
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <Box />
            {dates.map((date, i) => {
              const ds = toDateStr(date);
              const isToday = ds === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <Box
                  key={i}
                  sx={{
                    borderLeft: `1px solid ${divider}`,
                    py: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: isWeekend ? "text.secondary" : "text.primary" }}>
                    {DAYS_SHORT[(date.getDay() + 6) % 7]}
                  </Typography>
                  <Typography
                    onClick={() => { if (isMultiDay) { setCurrentDate(date); setView("day"); } }}
                    sx={{
                      width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "50%",
                      bgcolor: isToday ? "primary.main" : "transparent",
                      color: isToday ? "primary.contrastText" : isWeekend ? "text.secondary" : "text.primary",
                      fontSize: 16,
                      fontWeight: isToday ? 700 : 400,
                      cursor: isMultiDay ? "pointer" : "default",
                      "&:hover": isMultiDay ? { bgcolor: isToday ? "primary.dark" : "action.hover" } : {},
                    }}
                  >
                    {date.getDate()}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* All-day row */}
          {hasAllDay && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `${TIME_W}px repeat(${dates.length}, 1fr)`,
                borderBottom: `1px solid ${divider}`,
                minHeight: 32,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 1 }}>
                <Typography sx={{ fontSize: 10, color: "text.secondary" }}>All day</Typography>
              </Box>
              {allDayByCol.map((meetings, i) => (
                <Box key={i} sx={{ borderLeft: `1px solid ${divider}`, p: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {meetings.map((m) => (
                    <Box
                      key={m.id}
                      onClick={() => openMeeting(m)}
                      sx={{
                        bgcolor: "#E4F3FF",
                        borderRadius: "4px", px: "6px", py: "2px",
                        cursor: "pointer", "&:hover": { bgcolor: "#C8E0F7" },
                        overflow: "hidden",
                      }}
                    >
                      <Typography sx={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</Typography>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          )}
          <Box sx={{ display: "grid", gridTemplateColumns: `${TIME_W}px repeat(${dates.length}, 1fr)`, position: "relative" }}>
            {/* Hour labels */}
            <Box sx={{ position: "relative", height: totalH }}>
              {hours.map((h) => (
                <Box
                  key={h}
                  sx={{ position: "absolute", top: (h - HOUR_START) * HOUR_HEIGHT - 8, right: 8, height: HOUR_HEIGHT }}
                >
                  <Typography sx={{ fontSize: 10, color: "text.secondary", whiteSpace: "nowrap" }}>
                    {formatHour(h)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Day columns */}
            {dates.map((date, di) => {
              const meetings = timedByCol[di];
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isTodayCol = toDateStr(date) === todayStr;
              return (
                <Box
                  key={di}
                  sx={{
                    borderLeft: `1px solid ${divider}`,
                    position: "relative",
                    height: totalH,
                    bgcolor: isWeekend ? "action.hover" : "transparent",
                    outline: isTodayCol ? "2px solid #0040D5" : "none",
                    outlineOffset: "-1px",
                    zIndex: isTodayCol ? 1 : "auto",
                  }}
                >
                  {/* Hour lines */}
                  {hours.map((h) => (
                    <Box
                      key={h}
                      sx={{
                        position: "absolute",
                        top: (h - HOUR_START) * HOUR_HEIGHT,
                        left: 0, right: 0,
                        borderTop: `1px solid ${divider}`,
                      }}
                    />
                  ))}

                  {/* Meeting blocks */}
                  {meetings.map((m) => {
                    const startH = parseTimeHours(m.time!);
                    const clampedStart = Math.max(startH, HOUR_START);
                    const top = (clampedStart - HOUR_START) * HOUR_HEIGHT;
                    const height = Math.max(HOUR_HEIGHT - 8, 40);
                    return (
                      <Tooltip key={m.id} title={`${m.name} · ${m.time} · ${m.committee}`}>
                        <Box
                          onClick={() => openMeeting(m)}
                          sx={{
                            position: "absolute",
                            top: top + 4,
                            left: "4px",
                            right: "4px",
                            height,
                            bgcolor: "#E4F3FF",
                            borderRadius: "6px",
                            px: 1,
                            py: "5px",
                            cursor: "pointer",
                            overflow: "hidden",
                            "&:hover": { bgcolor: "#C8E0F7" },
                            zIndex: 1,
                          }}
                        >
                          <Typography sx={{ fontSize: 11, fontWeight: 600, lineHeight: "14px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {m.name}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: "text.secondary", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {m.time}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }

  function renderWeekView() {
    const ws = startOfWeek(currentDate);
    return renderTimeGrid(Array.from({ length: 7 }, (_, i) => addDays(ws, i)));
  }

  function renderDayView() {
    return renderTimeGrid([currentDate]);
  }

  return (
    <PageLayout id="page-calendar">
      <Box sx={{ pb: "12px" }}>
        <PageHeader
          pageTitle="Calendar"
          breadcrumbs={
            <OverflowBreadcrumbs
              items={[
                { id: "root", label: "Community v2", isDisabled: true },
                { id: "meetings", label: "Meetings" },
                { id: "calendar", label: "Calendar", isCurrent: true },
              ]}
            >
              {(item) => {
                const baseSx = { fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" };
                const mutedSx = { ...baseSx, color: "#6f7377" };
                const activeSx = { ...baseSx, color: "#282e37" };
                if (item.isCurrent) return <span />;
                if (item.id === "root") return (
                  <Box sx={{ height: 32, display: "flex", alignItems: "center", pr: "16px" }}>
                    <Typography sx={{ ...mutedSx, letterSpacing: "0.2px" }}>{item.label}</Typography>
                  </Box>
                );
                const textSx = item.isDisabled ? mutedSx : activeSx;
                const label = (
                  <Box sx={{ display: "flex", alignItems: "center", height: 24, px: "4px" }}>
                    <Typography sx={textSx}>{item.label}</Typography>
                  </Box>
                );
                if (item.isDisabled) return (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: "12px", py: "4px", borderRadius: "10px" }}>
                    {label}
                  </Box>
                );
                return (
                  <Box component="button" onClick={() => navigate("/meetings")} sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: "12px", py: "4px", borderRadius: "10px", cursor: "pointer", background: "none", border: "none", "&:hover": { bgcolor: "action.hover" } }}>
                    {label}
                  </Box>
                );
              }}
            </OverflowBreadcrumbs>
          }
        />
      </Box>

      <Stack direction="row" alignItems="center" mb={2} mt={-1}>
        {/* Left: Today button */}
        <Box sx={{ flex: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { setCurrentDate(new Date()); setView("day"); }}
          >
            Today
          </Button>
        </Box>

        {/* Center: navigation + title */}
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton size="small" onClick={goToPrev} aria-label="Previous">
            <ArrowLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ minWidth: 260, textAlign: "center", fontWeight: 600 }}>
            {getTitle()}
          </Typography>
          <IconButton size="small" onClick={goToNext} aria-label="Next">
            <ArrowRightIcon />
          </IconButton>
        </Stack>

        {/* Right: view switcher */}
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={view}
            onChange={(_, v) => { if (v) setView(v); }}
          >
            <ToggleButton value="year">Year</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {view === "year" && renderYearView()}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
    </PageLayout>
  );
}
