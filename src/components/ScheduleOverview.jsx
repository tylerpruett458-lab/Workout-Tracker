import React, { useMemo, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button, Card, CardContent } from "./ui";
import { REST_TIMES } from "../data/defaultPlans";
import {
  addDays,
  dateKey,
  displayDate,
  monthTitle,
  occurrenceDate,
  parseLocalDate,
  pct,
  readinessClass,
  readinessLabel,
  readinessShortLabel,
  nextReadinessValue,
  sessionForDay,
  sessionId,
  buildMonthCells
} from "../utils/training";

export default function ScheduleOverview({
  state,
  planCalendar,
  planSessions,
  blockLengthDays,
  sessionCounts,
  updateNested
}) {
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const baseCalendarDate = parseLocalDate(state.startDate) ?? new Date();
  const visibleCalendarDate = new Date(baseCalendarDate.getFullYear(), baseCalendarDate.getMonth() + calendarMonthOffset, 1);
  const visibleMonthYear = visibleCalendarDate.getFullYear();
  const visibleMonthIndex = visibleCalendarDate.getMonth();
  const monthCells = buildMonthCells(visibleMonthYear, visibleMonthIndex);

  const calendarEntriesByDate = useMemo(() => {
    const entries = {};
    const planStartDate = state.startDate || dateKey(baseCalendarDate);

    planCalendar.forEach((week, wi) => {
      week.forEach((plannedSession, di) => {
        const id = sessionId(wi, di, state.activeBlock);
        const date = state.customDates?.[id] || addDays(planStartDate, (state.activeBlock - 1) * blockLengthDays + wi * 7 + di);
        if (!date) return;
        entries[date] = {
          id,
          week: wi + 1,
          day: di + 1,
          plannedSession,
          session: sessionForDay(state, wi, di, state.activeBlock, planCalendar)
        };
      });
    });

    return entries;
  }, [planCalendar, state.activeBlock, state.sessionOverrides, state.customDates, state.startDate, blockLengthDays, baseCalendarDate]);

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-4">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold">Session progress</h2>
            <div className="space-y-4">
              {Object.entries(sessionCounts).map(([name, count]) => (
                <div key={name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-zinc-500">{count.done}/{count.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-zinc-900" style={{ width: `${pct(count.done, count.total)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Rest times</h2>
            <div className="space-y-2 text-sm">
              {Object.entries(REST_TIMES).map(([type, rest]) => (
                <div key={type} className="flex justify-between rounded-xl bg-zinc-50 px-3 py-2">
                  <span>{type}</span><span className="font-medium">{rest}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 md:p-5">
            <h2 className="mb-2 text-lg font-semibold">Schedule overview</h2>
            <p className="mb-4 text-sm text-zinc-500">
              The workout log controls are the main place to choose what you are logging. The compact calendar below uses the selected plan automatically. Tap a training day to cycle its feel-vs-baseline score; open advanced overrides only for manual schedule changes.
            </p>

            <div className="mb-4 rounded-2xl bg-zinc-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Monthly feel calendar</div>
                  <div className="mt-1 text-xs text-zinc-500">Tap the feel score on a training day to cycle baseline deviation. Use the ✓ button to mark completion.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCalendarMonthOffset((value) => value - 1)}>Previous</Button>
                  <div className="min-w-40 text-center text-sm font-semibold text-zinc-700">{monthTitle(visibleMonthYear, visibleMonthIndex)}</div>
                  <Button variant="outline" onClick={() => setCalendarMonthOffset((value) => value + 1)}>Next</Button>
                  <Button variant="outline" onClick={() => setCalendarMonthOffset(0)}>Today</Button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1 text-[11px] text-zinc-500">
                <span className="rounded-full border border-red-200 bg-red-100 px-2 py-1">-3</span>
                <span className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1">-2</span>
                <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-1">-1</span>
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-1">0</span>
                <span className="rounded-full border border-lime-200 bg-lime-100 px-2 py-1">+1</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-1">+2</span>
                <span className="rounded-full border border-emerald-300 bg-emerald-200 px-2 py-1">+3</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-1">{day}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((date) => {
                  const key = dateKey(date);
                  const entry = calendarEntriesByDate[key];
                  const isCurrentMonth = date.getMonth() === visibleMonthIndex;
                  const isToday = key === dateKey(new Date());
                  const value = entry ? state.readiness?.[entry.id] ?? "0" : "0";
                  const done = entry ? Boolean(state.completedDays[entry.id]) : false;
                  const rest = !entry || entry.session === "Rest";
                  return (
                    <div
                      key={key}
                      className={`min-h-24 rounded-xl border p-1.5 text-left ${readinessClass(value, rest)} ${isCurrentMonth ? "" : "opacity-40"} ${done ? "ring-2 ring-zinc-300" : ""} ${isToday ? "outline outline-2 outline-zinc-400" : ""}`}
                      title={entry ? `${key} · ${entry.session} · ${readinessLabel(value)}` : key}
                    >
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold">{date.getDate()}</span>
                        {entry && entry.session !== "Rest" && (
                          <button
                            onClick={() => updateNested("completedDays", entry.id, !done)}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${done ? "bg-zinc-900 text-white border-zinc-900" : "bg-white/80 text-zinc-500 border-zinc-300"}`}
                            title={done ? "Mark incomplete" : "Mark complete"}
                          >
                            ✓
                          </button>
                        )}
                      </div>
                      <div className="truncate text-[10px] font-medium opacity-80">{entry ? entry.session : ""}</div>
                      {entry && entry.session !== "Rest" && (
                        <button
                          onClick={() => updateNested("readiness", entry.id, nextReadinessValue(value))}
                          className="mt-2 w-full rounded-lg bg-white/60 px-1 py-1 text-center text-[11px] font-semibold hover:bg-white/90"
                          title="Tap to change feel-vs-baseline"
                        >
                          {readinessShortLabel(value)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <details className="rounded-2xl bg-zinc-50 p-3">
              <summary className="cursor-pointer select-none text-sm font-semibold text-zinc-700">Advanced Schedule Overrides</summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-1 text-sm">
                  <thead>
                    <tr className="text-zinc-500">
                      <th className="p-2 text-left">Week</th>
                      {Array.from({ length: 7 }, (_, i) => <th key={i} className="p-2 text-left">Day {i + 1}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {planCalendar.map((week, wi) => (
                      <tr key={wi}>
                        <td className="rounded-xl bg-zinc-100 p-2 font-semibold">Week {wi + 1}</td>
                        {week.map((plannedSession, di) => {
                          const id = sessionId(wi, di, state.activeBlock);
                          const session = sessionForDay(state, wi, di, state.activeBlock, planCalendar);
                          const done = Boolean(state.completedDays[id]);
                          const rest = session === "Rest";
                          return (
                            <td key={id} className={`rounded-xl p-2 ${rest ? "bg-zinc-100 text-zinc-400" : done ? "bg-zinc-200" : "bg-white border border-zinc-100"}`}>
                              <div className="space-y-2">
                                <div className="text-xs font-medium text-zinc-500">{displayDate(occurrenceDate(state, wi, di, state.activeBlock, blockLengthDays))}</div>
                                <button
                                  disabled={rest}
                                  onClick={() => updateNested("completedDays", id, !done)}
                                  className="flex w-full items-start gap-2 text-left disabled:cursor-not-allowed"
                                  title="Marks the day complete. Use the dropdown below if you did a different workout than planned."
                                >
                                  {rest ? <Circle className="mt-0.5 h-4 w-4" /> : done ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <Circle className="mt-0.5 h-4 w-4 text-zinc-400" />}
                                  <span>{session}</span>
                                </button>
                                <select
                                  value={session}
                                  onChange={(e) => updateNested("sessionOverrides", id, e.target.value === plannedSession ? undefined : e.target.value)}
                                  className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                                  title="Change what workout or rest day was actually completed"
                                >
                                  <option>Rest</option>
                                  {Object.keys(planSessions).map((name) => <option key={name}>{name}</option>)}
                                </select>
                                {session !== plannedSession && (
                                  <div className="text-[11px] text-zinc-500">Planned: {plannedSession}</div>
                                )}
                                {!rest && (
                                  <select
                                    value={state.readiness?.[id] ?? "0"}
                                    onChange={(e) => updateNested("readiness", id, e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
                                    title="How you felt compared with your normal baseline for this workout"
                                  >
                                    <option value="0">Baseline</option>
                                    <option value="3">+3 Great</option>
                                    <option value="2">+2 Good</option>
                                    <option value="1">+1 Slightly better</option>
                                    <option value="-1">-1 Slightly worse</option>
                                    <option value="-2">-2 Poor</option>
                                    <option value="-3">-3 Very poor</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
