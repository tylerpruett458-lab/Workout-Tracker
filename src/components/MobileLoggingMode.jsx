import React from "react";
import { exerciseId, parseReps, displayDate } from "../utils/training";

export default function MobileLoggingMode({ sessionName, activeOccurrenceId, activeDate, exercises, state, updateExerciseLog, updateNested }) {
  const completedCount = exercises.filter((exercise) => {
    const log = state.exerciseLog[exerciseId(activeOccurrenceId, sessionName, exercise.exercise)] ?? {};
    return Boolean(log.done) || parseReps(log.reps).length > 0;
  }).length;

  if (!exercises.length || sessionName === "Rest") {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
        No workout exercises are scheduled for this day. Choose a training day in the Workout log controls.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{sessionName}</h3>
          <p className="text-sm text-zinc-500">{displayDate(activeDate)} · {completedCount}/{exercises.length} exercises logged</p>
        </div>
        <button
          onClick={() => updateNested("completedDays", activeOccurrenceId, !state.completedDays[activeOccurrenceId])}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${state.completedDays[activeOccurrenceId] ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
        >
          {state.completedDays[activeOccurrenceId] ? "Workout complete" : "Mark workout complete"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {exercises.map((exercise, index) => {
          const id = exerciseId(activeOccurrenceId, sessionName, exercise.exercise);
          const log = state.exerciseLog[id] ?? {};
          const done = Boolean(log.done) || parseReps(log.reps).length > 0;
          return (
            <div key={`${id}-mobile`} className={`rounded-2xl border p-3 ${done ? "border-zinc-300 bg-zinc-50" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-400">#{index + 1} · {exercise.muscle}</div>
                  <div className="text-base font-semibold text-zinc-900">{exercise.exercise}</div>
                  <div className="mt-1 text-xs text-zinc-500">{exercise.setsReps} · {exercise.type}</div>
                </div>
                <button
                  onClick={() => updateExerciseLog(id, { done: !done, skipped: false })}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${done ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {done ? "Done" : "Mark done"}
                </button>
              </div>

              <div className="mt-3 grid gap-2 grid-cols-2">
                <label className="text-xs font-medium text-zinc-600">
                  Weight
                  <input value={log.weight ?? ""} onChange={(e) => updateExerciseLog(id, { weight: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="lbs" />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Reps
                  <input value={log.reps ?? ""} onChange={(e) => updateExerciseLog(id, { reps: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="8,8,7" />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  RIR
                  <input value={log.rir ?? ""} onChange={(e) => updateExerciseLog(id, { rir: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="1-3" />
                </label>
                <label className="text-xs font-medium text-zinc-600">
                  Pain
                  <select value={log.painStatus ?? "No pain"} onChange={(e) => updateExerciseLog(id, { painStatus: e.target.value })} className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                    <option>No pain</option>
                    <option>Mild pain</option>
                    <option>Moderate pain</option>
                    <option>Injury / stop</option>
                  </select>
                </label>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => updateExerciseLog(id, { skipped: !log.skipped, done: false })} className={`rounded-full px-3 py-1 text-xs font-semibold ${log.skipped ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"}`}>{log.skipped ? "Skipped" : "Mark skipped"}</button>
                <button onClick={() => updateExerciseLog(id, { weight: "", reps: "", rir: "", done: false, skipped: false })} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">Clear</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
