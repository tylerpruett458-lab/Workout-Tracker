import React from "react";
import { Card, CardContent } from "./ui";

export default function PlanSelectorCard({ state, activePlanKey, planName, updateState, selectBuiltInPlan, onNextIncompleteWorkout, onGoToToday, quickStatus }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="block text-sm font-medium text-zinc-700">
            Mesocycle start date
            <input
              type="date"
              value={state.startDate}
              onChange={(e) => updateState({ startDate: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Active Workout Plan
            <select
              value={activePlanKey}
              onChange={(e) => selectBuiltInPlan(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
            >
              <option value="default">Default Upper / Lower Mesocycle</option>
              <option value="pdf:mansour">Mansour Method</option>
              <option value="pdf:purePpl">Pure Bodybuilding PPL/Arms</option>
              <option value="pdf:pureUpperLower">Pure Bodybuilding Upper/Lower</option>
              {(state.savedPlans ?? []).map((item) => <option key={item.id} value={`saved:${item.id}`}>Saved Plan: {item.name}</option>)}
              {state.customPlan && activePlanKey === "custom" && <option value="custom">Current Custom Plan: {planName}</option>}
            </select>
            <div className="mt-1 text-xs text-zinc-500">Use Import Plan to load a file, or Advanced Mode → Plan Builder to edit saved plans.</div>
          </label>
          <div className="grid gap-2 text-sm font-medium text-zinc-700">
            <div>View mode</div>
            <div className="flex rounded-2xl border border-zinc-200 bg-white p-1">
              <button
                type="button"
                onClick={() => updateState({ viewMode: "simple" })}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${state.viewMode !== "advanced" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => updateState({ viewMode: "advanced" })}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${state.viewMode === "advanced" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                Advanced
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onGoToToday}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Go to Today
              </button>
              <button
                type="button"
                onClick={onNextIncompleteWorkout}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Next Incomplete
              </button>
            </div>
          </div>
        </div>
        {quickStatus && (
          <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
            <div className="rounded-2xl bg-zinc-50 p-3"><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">This block</span><span className="font-semibold text-zinc-800">{quickStatus.completion}</span></div>
            <div className="rounded-2xl bg-zinc-50 p-3"><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Last logged</span><span className="font-semibold text-zinc-800">{quickStatus.lastLogged}</span></div>
            <div className="rounded-2xl bg-zinc-50 p-3"><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Next workout</span><span className="font-semibold text-zinc-800">{quickStatus.nextWorkout}</span></div>
            <div className="rounded-2xl bg-zinc-50 p-3"><span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Pain flags</span><span className="font-semibold text-zinc-800">{quickStatus.painFlags}</span></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
