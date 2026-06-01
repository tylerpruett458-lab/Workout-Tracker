import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "./ui";
import { REST_TIMES } from "../data/defaultPlans";
import { blockLabel, displayDate, exerciseId, sessionForDay } from "../utils/training";

export default function WorkoutLog({
  state,
  planCalendar,
  planSessions,
  activeSession,
  activeOccurrenceId,
  activeDate,
  updateState,
  updateNested,
  updateExerciseLog,
  setTrendExercise
}) {
  const [query, setQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState("Current day");
  const [expanded, setExpanded] = useState({});

  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sessionToShow = selectedSession === "Current day" ? activeSession : selectedSession;
    const entries = Object.entries(planSessions).flatMap(([sessionName, exercises]) =>
      exercises.map((e) => ({ ...e, sessionName }))
    );
    return entries.filter((e) => {
      if (sessionToShow !== "All" && e.sessionName !== sessionToShow) return false;
      if (!q) return true;
      return `${e.sessionName} ${e.muscle} ${e.exercise} ${e.setsReps} ${e.type}`.toLowerCase().includes(q);
    });
  }, [query, selectedSession, activeSession, planSessions]);

  return (
    <details className="order-1 rounded-2xl bg-zinc-100 p-4">
      <summary className="cursor-pointer select-none text-lg font-semibold">Detailed Workout Log</summary>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-sm text-zinc-600">
            Select the exact week and day you are logging. Each occurrence saves separately, so the same session in different weeks has different logs.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <label className="text-sm font-medium text-zinc-700">
              Block
              <select value={state.activeBlock} onChange={(e) => updateState({ activeBlock: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                {Array.from({ length: state.blockCount }, (_, i) => <option key={i + 1} value={i + 1}>{blockLabel(i + 1)}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Data view
              <select value={state.dataScope} onChange={(e) => updateState({ dataScope: e.target.value })} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                <option>Current block</option>
                <option>All blocks</option>
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Week
              <select value={state.activeWeek} onChange={(e) => updateState({ activeWeek: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                {Array.from({ length: planCalendar.length }, (_, i) => <option key={i + 1} value={i + 1}>Week {i + 1}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Day
              <select value={state.activeDay} onChange={(e) => updateState({ activeDay: Number(e.target.value) })} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                {Array.from({ length: 7 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Day {i + 1} · {sessionForDay(state, state.activeWeek - 1, i, state.activeBlock, planCalendar)}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Date
              <input
                type="date"
                value={activeDate}
                onChange={(e) => updateNested("customDates", activeOccurrenceId, e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => updateState({ blockCount: state.blockCount + 1, activeBlock: state.blockCount + 1 })}>Add next block</Button>
            {state.blockCount > 1 && <Button variant="outline" onClick={() => updateState({ activeBlock: 1, dataScope: "All blocks" })}>View all blocks</Button>}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises, muscles, sessions..."
              className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-zinc-400"
            />
          </label>
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-400">
            <option>Current day</option>
            <option>All</option>
            {Object.keys(planSessions).map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-600">
          Currently logging <span className="font-semibold text-zinc-900">Block {state.activeBlock}, Week {state.activeWeek}, Day {state.activeDay}: {activeSession}</span>{activeDate ? <span> on <span className="font-semibold text-zinc-900">{displayDate(activeDate)}</span></span> : null}. Use the controls above to switch to a different workout occurrence.
        </div>

        <div className="space-y-3">
          {Object.keys(planSessions).map((sessionName) => {
            const visible = filteredExercises.filter((e) => e.sessionName === sessionName);
            if (!visible.length) return null;
            const isOpen = expanded[sessionName] ?? false;
            return (
              <div key={sessionName} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <button onClick={() => setExpanded((prev) => ({ ...prev, [sessionName]: !isOpen }))} className="mb-3 flex w-full items-center justify-between text-left">
                  <span className="flex items-center gap-2 text-lg font-semibold">
                    {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    {sessionName}
                  </span>
                  <span className="text-sm text-zinc-500">{visible.length} exercises</span>
                </button>
                {isOpen && (
                  <div className="grid gap-3">
                    {visible.map((e) => {
                      const id = exerciseId(activeOccurrenceId, sessionName, e.exercise);
                      const log = state.exerciseLog[id] ?? {};
                      return (
                        <div key={id} className="rounded-2xl bg-white p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="text-base font-semibold">{e.exercise}</div>
                                <button onClick={() => setTrendExercise(e.exercise)} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200">View history</button>
                              </div>
                              <div className="mt-1 text-sm text-zinc-600">{e.muscle} · {e.setsReps} · {e.type} · Rest {REST_TIMES[e.type]}</div>
                            </div>
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">Block {state.activeBlock} · Week {state.activeWeek} · Day {state.activeDay} · {sessionName}</span>
                          </div>
                          <div className="mt-3 grid gap-2 md:grid-cols-6">
                            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                              <input type="checkbox" checked={Boolean(log.done)} onChange={(ev) => updateExerciseLog(id, { done: ev.target.checked })} /> Done
                            </label>
                            <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                              <input type="checkbox" checked={Boolean(log.skipped)} onChange={(ev) => updateExerciseLog(id, { skipped: ev.target.checked })} /> Skipped
                            </label>
                            <input value={log.weight ?? ""} onChange={(ev) => updateExerciseLog(id, { weight: ev.target.value })} placeholder="Weight used" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                            <input value={log.targetWeight ?? ""} onChange={(ev) => updateExerciseLog(id, { targetWeight: ev.target.value })} placeholder="Goal weight" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                            <input value={log.reps ?? ""} onChange={(ev) => updateExerciseLog(id, { reps: ev.target.value })} placeholder="Reps e.g. 8,8,7" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                            <input value={log.rir ?? ""} onChange={(ev) => updateExerciseLog(id, { rir: ev.target.value })} placeholder="RIR" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                          </div>
                          <div className="mt-2 grid gap-2 md:grid-cols-[1fr_2fr]">
                            <select value={log.painStatus ?? "No pain"} onChange={(ev) => updateExerciseLog(id, { painStatus: ev.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                              <option>No pain</option>
                              <option>Mild pain</option>
                              <option>Moderate pain</option>
                              <option>Injury / stop</option>
                            </select>
                            <input value={log.painNotes ?? ""} onChange={(ev) => updateExerciseLog(id, { painNotes: ev.target.value })} placeholder="Pain/injury notes: location, movement, severity, modification..." className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                          </div>
                          <input value={log.next ?? ""} onChange={(ev) => updateExerciseLog(id, { next: ev.target.value })} placeholder="Next step" className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
                          <textarea value={log.notes ?? ""} onChange={(ev) => updateExerciseLog(id, { notes: ev.target.value })} placeholder="Technique notes, pain, setup, progression reminders..." className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
