import React from "react";
import {
  BlockComparison,
  ConsistencyChart,
  ExerciseHistory,
  FatigueReadinessDashboard,
  MuscleVolumeTracker,
  TrendChart
} from "./Analytics";

export default function AnalyticsSections({
  muscleVolumeData,
  consistencyData,
  allExerciseNames,
  trendExercise,
  setTrendExercise,
  trendMetric,
  setTrendMetric,
  trendData
}) {
  return (
    <>
      <details className="order-3 rounded-2xl bg-zinc-100 p-4">
        <summary className="cursor-pointer select-none text-lg font-semibold">Muscle group volume tracker</summary>
        <div className="mt-3">
          <p className="text-sm text-zinc-600">Shows planned and completed sets by muscle group for each week in the current block or across all blocks.</p>
          <MuscleVolumeTracker data={muscleVolumeData} />
        </div>
      </details>

      <details className="order-4 rounded-2xl bg-zinc-100 p-4">
        <summary className="cursor-pointer select-none text-lg font-semibold">Fatigue / readiness dashboard</summary>
        <div className="mt-3">
          <p className="text-sm text-zinc-600">Combines feel-vs-baseline, missed workouts, skipped work, goal effort, pain notes, and injury stops to flag weeks that may need recovery attention.</p>
          <FatigueReadinessDashboard data={consistencyData} />
        </div>
      </details>

      <details className="order-5 rounded-2xl bg-zinc-100 p-4">
        <summary className="cursor-pointer select-none text-lg font-semibold">Consistency tracker</summary>
        <div className="mt-3">
          <p className="mt-1 text-sm text-zinc-600">Tracks how often planned workouts are completed, how much of each workout is completed, and a perceived effort score based on logged reps and target weight.</p>
          <ConsistencyChart data={consistencyData} />
          <BlockComparison data={consistencyData} />
        </div>
      </details>

      <details className="order-6 rounded-2xl bg-zinc-100 p-4">
        <summary className="cursor-pointer select-none text-lg font-semibold">Progressive overload trends & exercise history</summary>
        <div className="mt-3">
          <p className="mt-1 text-sm text-zinc-600">This chart uses your logged weight and reps across separate workout occurrences. For reps, enter sets like 8,8,7. Estimated volume is weight × total reps.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]">
            <label className="text-sm font-medium text-zinc-700">
              Exercise
              <select value={trendExercise} onChange={(e) => setTrendExercise(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                {allExerciseNames.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-700">
              Metric
              <select value={trendMetric} onChange={(e) => setTrendMetric(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
                <option>Estimated volume</option>
                <option>Weight</option>
                <option>Total reps</option>
                <option>Best set reps</option>
              </select>
            </label>
          </div>
          <TrendChart data={trendData} metric={trendMetric} />
          <ExerciseHistory exercise={trendExercise} data={trendData} />
        </div>
      </details>
    </>
  );
}
