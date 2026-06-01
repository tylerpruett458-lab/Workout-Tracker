import React, { useEffect, useState } from "react";
import { Button } from "./ui";
import { COMMON_EXERCISES_BY_MUSCLE, commonExercisesForMuscle } from "../data/exerciseOptions";

export default function PlanBuilder({ plan, savedPlans = [], selectedSavedPlanId = "", onSavePlan, onUpdateSavedPlan, onLoadSavedPlan, onDeleteSavedPlanById }) {
  const [draftPlan, setDraftPlan] = useState(() => JSON.parse(JSON.stringify(plan)));
  const [selectedSession, setSelectedSession] = useState(Object.keys(plan.sessions ?? {})[0] ?? "");
  const [restPattern, setRestPattern] = useState("2 on / 1 off");
  const [builderSavedPlanId, setBuilderSavedPlanId] = useState(selectedSavedPlanId);

  useEffect(() => {
    const copy = JSON.parse(JSON.stringify(plan));
    setDraftPlan(copy);
    setSelectedSession(Object.keys(copy.sessions ?? {})[0] ?? "");
    setBuilderSavedPlanId(selectedSavedPlanId);
  }, [JSON.stringify(plan), selectedSavedPlanId]);

  const sessions = draftPlan.sessions ?? {};
  const calendar = draftPlan.calendar ?? [];
  const sessionNames = Object.keys(sessions);
  const selectedExercises = sessions[selectedSession] ?? [];

  useEffect(() => {
    if (!sessionNames.includes(selectedSession)) {
      setSelectedSession(sessionNames[0] ?? "");
    }
  }, [sessionNames.join("|"), selectedSession]);

  function updateDraft(updater) {
    setDraftPlan((prev) => {
      const next = typeof updater === "function" ? updater(JSON.parse(JSON.stringify(prev))) : updater;
      return next;
    });
  }

  function updatePlanName(value) {
    updateDraft((next) => ({ ...next, planName: value || "Custom Workout Plan" }));
  }

  function addSession() {
    const name = window.prompt("New session name, for example Push, Pull, Legs, Chest & Arms:");
    if (!name?.trim()) return;
    const clean = name.trim();
    if (sessions[clean]) {
      alert("That session already exists.");
      return;
    }
    updateDraft((next) => {
      next.sessions = next.sessions ?? {};
      next.sessions[clean] = [];
      return next;
    });
    setSelectedSession(clean);
  }

  function renameSession() {
    if (!selectedSession) return;
    const name = window.prompt("Rename session:", selectedSession);
    if (!name?.trim()) return;
    const clean = name.trim();
    if (clean === selectedSession) return;
    if (sessions[clean]) {
      alert("That session already exists.");
      return;
    }
    updateDraft((next) => {
      next.sessions[clean] = next.sessions[selectedSession] ?? [];
      delete next.sessions[selectedSession];
      next.calendar = (next.calendar ?? []).map((week) => week.map((day) => day === selectedSession ? clean : day));
      return next;
    });
    setSelectedSession(clean);
  }

  function deleteSession() {
    if (!selectedSession) return;
    if (!window.confirm(`Delete ${selectedSession}? Calendar days using it will become Rest.`)) return;
    updateDraft((next) => {
      delete next.sessions[selectedSession];
      next.calendar = (next.calendar ?? []).map((week) => week.map((day) => day === selectedSession ? "Rest" : day));
      return next;
    });
  }

  function addExercise() {
    if (!selectedSession) return;
    updateDraft((next) => {
      next.sessions[selectedSession] = next.sessions[selectedSession] ?? [];
      next.sessions[selectedSession].push({ muscle: "Chest", exercise: "Barbell Bench Press", setsReps: "3 x 8–12", type: "Isolation" });
      return next;
    });
  }

  function updateExercise(index, patch) {
    updateDraft((next) => {
      next.sessions[selectedSession][index] = { ...next.sessions[selectedSession][index], ...patch };
      return next;
    });
  }

  function deleteExercise(index) {
    updateDraft((next) => {
      next.sessions[selectedSession].splice(index, 1);
      return next;
    });
  }

  function updateCalendarDay(weekIndex, dayIndex, value) {
    updateDraft((next) => {
      next.calendar = Array.isArray(next.calendar) ? next.calendar : [];
      while (next.calendar.length <= weekIndex) next.calendar.push(Array.from({ length: 7 }, () => "Rest"));
      next.calendar[weekIndex] = Array.isArray(next.calendar[weekIndex]) ? next.calendar[weekIndex] : Array.from({ length: 7 }, () => "Rest");
      next.calendar[weekIndex][dayIndex] = value;
      next.weeks = next.calendar.length;
      return next;
    });
  }

  function addWeek() {
    updateDraft((next) => {
      next.calendar = Array.isArray(next.calendar) ? next.calendar : [];
      next.calendar.push(Array.from({ length: 7 }, () => "Rest"));
      next.weeks = next.calendar.length;
      return next;
    });
  }

  function removeLastWeek() {
    updateDraft((next) => {
      next.calendar = Array.isArray(next.calendar) ? next.calendar : [];
      if (next.calendar.length > 1) next.calendar.pop();
      next.weeks = next.calendar.length;
      return next;
    });
  }

  function loadPlanForEditing(planId) {
    setBuilderSavedPlanId(planId);
    if (!planId) {
      const copy = JSON.parse(JSON.stringify(plan));
      setDraftPlan(copy);
      setSelectedSession(Object.keys(copy.sessions ?? {})[0] ?? "");
      return;
    }
    const loaded = onLoadSavedPlan?.(planId);
    if (!loaded) return;
    setDraftPlan(loaded);
    setSelectedSession(Object.keys(loaded.sessions ?? {})[0] ?? "");
  }

  function updateSelectedSavedPlanFromDraft() {
    if (!builderSavedPlanId) {
      alert("Choose a saved plan in the Load Saved Plan for Editing dropdown first.");
      return;
    }
    onUpdateSavedPlan(draftPlan, builderSavedPlanId);
  }

  function deleteBuilderSavedPlan() {
    if (!builderSavedPlanId) {
      alert("Choose a saved plan to delete.");
      return;
    }
    onDeleteSavedPlanById?.(builderSavedPlanId);
    setBuilderSavedPlanId("");
  }

  function buildCalendarFromRestPattern() {
    const names = Object.keys(draftPlan.sessions ?? {});
    if (!names.length) {
      alert("Add at least one session first.");
      return;
    }

    const weeks = Math.max(1, calendar.length || Number(draftPlan.weeks) || 12);
    const totalDays = weeks * 7;
    const days = [];
    let sessionIndex = 0;

    for (let i = 0; i < totalDays; i += 1) {
      const dayNumber = i + 1;
      const dayOfWeek = i % 7;
      let rest = false;

      if (restPattern === "1 on / 1 off") rest = dayNumber % 2 === 0;
      else if (restPattern === "2 on / 1 off") rest = dayNumber % 3 === 0;
      else if (restPattern === "3 on / 1 off") rest = dayNumber % 4 === 0;
      else if (restPattern === "4 on / 1 off") rest = dayNumber % 5 === 0;
      else if (restPattern === "5 on / 2 off") rest = dayOfWeek === 5 || dayOfWeek === 6;
      else if (restPattern === "No planned rest") rest = false;

      if (rest) {
        days.push("Rest");
      } else {
        days.push(names[sessionIndex % names.length]);
        sessionIndex += 1;
      }
    }

    if (!window.confirm(`Apply ${restPattern} to the Plan Builder draft calendar? This will replace the draft calendar only.`)) return;

    updateDraft((next) => {
      next.calendar = Array.from({ length: weeks }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7));
      next.weeks = next.calendar.length;
      return next;
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
        <span className="font-semibold">Draft editing only:</span> Plan Builder changes do not change the active tracker until you save the plan and select it from the Active Workout Plan dropdown.
      </div>

      <div className="mt-4 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-600">
        Draft preview: {draftPlan.planName ?? "Unnamed plan"} · {calendar.length || 0} week{calendar.length === 1 ? "" : "s"} · {sessionNames.length} session{sessionNames.length === 1 ? "" : "s"}
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="text-sm font-medium text-zinc-700">
            Load Saved Plan for Editing
            <select value={builderSavedPlanId} onChange={(e) => loadPlanForEditing(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm">
              <option value="">Current active/default draft</option>
              {savedPlans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <Button variant="outline" onClick={updateSelectedSavedPlanFromDraft} className="mt-7">Update loaded plan</Button>
          <Button variant="outline" onClick={deleteBuilderSavedPlan} className="mt-7">Delete loaded plan</Button>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Loading a saved plan here only opens it for editing. It does not make it the active workout plan until selected from the Active Workout Plan dropdown.
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <label className="text-sm font-medium text-zinc-700">
          Plan name
          <input value={draftPlan.planName ?? ""} onChange={(e) => updatePlanName(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Session
          <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
            {sessionNames.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <Button variant="outline" onClick={addSession} className="mt-7">Add session</Button>
        <Button variant="outline" onClick={renameSession} className="mt-7">Rename session</Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" onClick={deleteSession}>Delete selected session</Button>
        <Button onClick={addExercise}>Add exercise</Button>
        <Button variant="outline" onClick={() => onSavePlan(draftPlan)}>Save plan</Button>
        <Button variant="outline" onClick={updateSelectedSavedPlanFromDraft}>Update loaded plan</Button>
        <Button variant="outline" onClick={deleteBuilderSavedPlan}>Delete loaded plan</Button>
      </div>

      <div className="mt-4 space-y-3">
        {selectedExercises.map((exercise, index) => (
          <div key={`${selectedSession}-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_1fr_auto]">
              <select
                value={exercise.muscle ?? "Other"}
                onChange={(e) => {
                  const muscle = e.target.value;
                  const currentOptions = commonExercisesForMuscle(muscle);
                  updateExercise(index, { muscle, exercise: currentOptions[0] ?? exercise.exercise ?? "Custom Exercise" });
                }}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              >
                {Object.keys(COMMON_EXERCISES_BY_MUSCLE).map((muscle) => <option key={muscle}>{muscle}</option>)}
              </select>
              <div className="grid gap-2">
                <select
                  value={commonExercisesForMuscle(exercise.muscle).includes(exercise.exercise) ? exercise.exercise : "Custom"}
                  onChange={(e) => updateExercise(index, { exercise: e.target.value === "Custom" ? "" : e.target.value })}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                >
                  {commonExercisesForMuscle(exercise.muscle).map((name) => <option key={name}>{name}</option>)}
                  <option>Custom</option>
                </select>
                <input
                  value={exercise.exercise ?? ""}
                  onChange={(e) => updateExercise(index, { exercise: e.target.value })}
                  placeholder="Exercise name or custom exercise"
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <input value={exercise.setsReps ?? ""} onChange={(e) => updateExercise(index, { setsReps: e.target.value })} placeholder="Sets x reps" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
              <select value={exercise.type ?? "Isolation"} onChange={(e) => updateExercise(index, { type: e.target.value })} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                <option>Heavy compound</option>
                <option>Machine compound</option>
                <option>Isolation</option>
                <option>Core</option>
              </select>
              <Button variant="outline" onClick={() => deleteExercise(index)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
        <h3 className="text-sm font-semibold">Plan Builder rest-day tool</h3>
        <p className="mt-1 text-xs text-zinc-500">This replaces the old rest-frequency/calendar layout system. It only changes this draft calendar.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="text-sm font-medium text-zinc-700">
            Rest pattern
            <select value={restPattern} onChange={(e) => setRestPattern(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm">
              <option>1 on / 1 off</option>
              <option>2 on / 1 off</option>
              <option>3 on / 1 off</option>
              <option>4 on / 1 off</option>
              <option>5 on / 2 off</option>
              <option>No planned rest</option>
            </select>
          </label>
          <Button onClick={buildCalendarFromRestPattern} className="mt-7">Apply to draft calendar</Button>
          <Button variant="outline" onClick={addWeek} className="mt-7">Add week</Button>
          <Button variant="outline" onClick={removeLastWeek} className="mt-7">Remove last week</Button>
        </div>
      </div>

      <details className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
        <summary className="cursor-pointer select-none text-sm font-semibold">Manual draft calendar editor</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-1 text-sm">
            <thead className="text-left text-zinc-500">
              <tr><th className="p-2">Week</th>{Array.from({ length: 7 }, (_, i) => <th key={i} className="p-2">Day {i + 1}</th>)}</tr>
            </thead>
            <tbody>
              {calendar.map((week, wi) => (
                <tr key={wi}>
                  <td className="rounded-xl bg-white p-2 font-semibold">Week {wi + 1}</td>
                  {Array.from({ length: 7 }, (_, di) => (
                    <td key={`${wi}-${di}`} className="rounded-xl bg-white p-2">
                      <select value={week[di] ?? "Rest"} onChange={(e) => updateCalendarDay(wi, di, e.target.value)} className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-xs">
                        <option>Rest</option>
                        {sessionNames.map((name) => <option key={name}>{name}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
