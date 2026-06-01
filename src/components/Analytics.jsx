import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui";
import { pct } from "../utils/training";

export function FatigueReadinessDashboard({ data }) {
  if (!data.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
        No fatigue/readiness data yet. Complete workouts, log effort, and add feel-vs-baseline entries to build this dashboard.
      </div>
    );
  }

  const scoredRows = data.map((row) => {
    const missedWorkoutPenalty = Math.max(0, 100 - (row.workoutCompletionPct ?? 0)) * 0.25;
    const setPenalty = Math.max(0, 100 - (row.avgSetCompletion ?? 0)) * 0.2;
    const effortPenalty = row.avgPerceivedEffort ? Math.max(0, 90 - row.avgPerceivedEffort) * 0.25 : 8;
    const readinessPenalty = row.avgReadiness < 0 ? Math.abs(row.avgReadiness) * 10 : 0;
    const painPenalty = (row.painEvents ?? 0) * 4;
    const injuryPenalty = (row.injuryStops ?? 0) * 15;
    const score = Math.min(100, Math.round(missedWorkoutPenalty + setPenalty + effortPenalty + readinessPenalty + painPenalty + injuryPenalty));
    const status = score >= 60 ? "High fatigue risk" : score >= 35 ? "Moderate fatigue risk" : score >= 18 ? "Watch" : "Normal";
    const mainDriver = row.injuryStops ? "Injury stop" : row.painEvents ? "Pain notes" : row.avgReadiness < 0 ? "Low readiness" : row.workoutCompletionPct < 80 ? "Missed workouts" : row.avgSetCompletion < 80 ? "Low set completion" : "Stable";
    return { ...row, fatigueScore: score, fatigueStatus: status, mainDriver };
  });

  const latest = scoredRows[scoredRows.length - 1];
  const highRiskWeeks = scoredRows.filter((row) => row.fatigueScore >= 60).length;
  const moderateRiskWeeks = scoredRows.filter((row) => row.fatigueScore >= 35 && row.fatigueScore < 60).length;
  const avgFatigue = Math.round(scoredRows.reduce((sum, row) => sum + row.fatigueScore, 0) / scoredRows.length);
  const totalPain = scoredRows.reduce((sum, row) => sum + (row.painEvents ?? 0), 0);
  const totalInjuries = scoredRows.reduce((sum, row) => sum + (row.injuryStops ?? 0), 0);

  const width = 760;
  const height = 230;
  const padding = 34;
  const chartHeight = height - padding * 2;
  const step = scoredRows.length > 1 ? (width - padding * 2) / (scoredRows.length - 1) : 0;
  const points = scoredRows.map((row, index) => {
    const x = scoredRows.length === 1 ? width / 2 : padding + index * step;
    const y = height - padding - (row.fatigueScore / 100) * chartHeight;
    return { ...row, x, y };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="grid gap-2 text-sm md:grid-cols-5">
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Latest status</span><span className="font-semibold">{latest?.fatigueStatus ?? "—"}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Avg fatigue score</span><span className="font-semibold">{avgFatigue}/100</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">High-risk weeks</span><span className="font-semibold">{highRiskWeeks}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Pain notes</span><span className="font-semibold">{totalPain}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Injury stops</span><span className="font-semibold">{totalInjuries}</span></div>
      </div>

      <div className="mt-4 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-600">
        Fatigue score is a planning signal, not a medical diagnosis. It rises when workouts are missed, set completion drops, goal effort drops, readiness is below baseline, or pain/injury entries increase.
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] rounded-xl bg-zinc-50">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <line x1={padding} y1={height - padding - 0.6 * chartHeight} x2={width - padding} y2={height - padding - 0.6 * chartHeight} stroke="currentColor" strokeDasharray="4 4" className="text-zinc-300" />
          <line x1={padding} y1={height - padding - 0.35 * chartHeight} x2={width - padding} y2={height - padding - 0.35 * chartHeight} stroke="currentColor" strokeDasharray="4 4" className="text-zinc-300" />
          <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="11" className="fill-zinc-500">100</text>
          <text x={padding - 8} y={height - padding + 4} textAnchor="end" fontSize="11" className="fill-zinc-500">0</text>
          {points.length > 1 && <polyline points={line} fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-900" />}
          {points.map((p, index) => (
            <circle key={`${p.label}-${index}`} cx={p.x} cy={p.y} r="5" fill="currentColor" className={p.fatigueScore >= 60 ? "text-zinc-900" : p.fatigueScore >= 35 ? "text-zinc-600" : "text-zinc-400"}>
              <title>{`${p.label}: ${p.fatigueScore}/100 · ${p.fatigueStatus} · Driver: ${p.mainDriver}`}</title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="p-2">Week</th>
              <th className="p-2">Score</th>
              <th className="p-2">Status</th>
              <th className="p-2">Main driver</th>
              <th className="p-2">Workouts</th>
              <th className="p-2">Sets</th>
              <th className="p-2">Goal effort</th>
              <th className="p-2">Feel</th>
              <th className="p-2">Pain / injury</th>
            </tr>
          </thead>
          <tbody>
            {scoredRows.map((row) => (
              <tr key={`${row.label}-fatigue`} className="border-t border-zinc-100">
                <td className="p-2 font-medium">{row.label}</td>
                <td className="p-2">{row.fatigueScore}/100</td>
                <td className="p-2">{row.fatigueStatus}</td>
                <td className="p-2">{row.mainDriver}</td>
                <td className="p-2">{row.workoutsCompleted}/{row.workoutsPlanned} · {row.workoutCompletionPct}%</td>
                <td className="p-2">{row.avgSetCompletion}%</td>
                <td className="p-2">{row.avgPerceivedEffort || "—"}%</td>
                <td className="p-2">{row.avgReadiness > 0 ? "+" : ""}{row.avgReadiness || "—"}</td>
                <td className="p-2">{row.painEvents || 0} pain · {row.injuryStops || 0} stop</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MuscleVolumeTracker({ data }) {
  const allMuscles = Array.from(new Set(data.flatMap((week) => week.muscles.map((m) => m.muscle)))).sort((a, b) => a.localeCompare(b));
  const [selectedMuscle, setSelectedMuscle] = useState(allMuscles[0] ?? "All");

  useEffect(() => {
    if (selectedMuscle !== "All" && !allMuscles.includes(selectedMuscle)) {
      setSelectedMuscle(allMuscles[0] ?? "All");
    }
  }, [allMuscles.join("|"), selectedMuscle]);

  if (!data.length || !allMuscles.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
        No muscle volume data yet. Log workouts or mark exercises done to build this chart.
      </div>
    );
  }

  const displayRows = selectedMuscle === "All"
    ? data.map((week) => ({
        ...week,
        plannedSets: week.muscles.reduce((sum, m) => sum + m.plannedSets, 0),
        completedSets: week.muscles.reduce((sum, m) => sum + m.completedSets, 0)
      }))
    : data.map((week) => {
        const muscle = week.muscles.find((m) => m.muscle === selectedMuscle) ?? { plannedSets: 0, completedSets: 0 };
        return { ...week, plannedSets: muscle.plannedSets, completedSets: muscle.completedSets };
      });

  const maxSets = Math.max(...displayRows.map((row) => Math.max(row.plannedSets, row.completedSets)), 1);
  const width = 760;
  const height = 240;
  const padding = 34;
  const chartHeight = height - padding * 2;
  const barGroupWidth = (width - padding * 2) / displayRows.length;

  const totals = allMuscles.map((muscle) => {
    const plannedSets = data.reduce((sum, week) => sum + (week.muscles.find((m) => m.muscle === muscle)?.plannedSets ?? 0), 0);
    const completedSets = data.reduce((sum, week) => sum + (week.muscles.find((m) => m.muscle === muscle)?.completedSets ?? 0), 0);
    return { muscle, plannedSets, completedSets, completion: pct(completedSets, plannedSets) };
  }).sort((a, b) => b.completedSets - a.completedSets || a.muscle.localeCompare(b.muscle));

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
        <label className="text-sm font-medium text-zinc-700">
          Muscle group
          <select value={selectedMuscle} onChange={(e) => setSelectedMuscle(e.target.value)} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm">
            <option>All</option>
            {allMuscles.map((muscle) => <option key={muscle}>{muscle}</option>)}
          </select>
        </label>
        <div className="rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-600">
          Completed sets are counted from logged reps. If an exercise is marked Done but reps are blank, the tracker counts the prescribed sets. Skipped exercises count as zero completed sets.
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] rounded-xl bg-zinc-50">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <text x={padding - 8} y={padding - 10} textAnchor="end" fontSize="11" className="fill-zinc-500">{maxSets}</text>
          {displayRows.map((row, index) => {
            const groupX = padding + index * barGroupWidth + 6;
            const barWidth = Math.max(5, (barGroupWidth - 14) / 2);
            const plannedHeight = (row.plannedSets / maxSets) * chartHeight;
            const completedHeight = (row.completedSets / maxSets) * chartHeight;
            return (
              <g key={`${row.label}-${index}`}>
                <rect x={groupX} y={height - padding - plannedHeight} width={barWidth} height={plannedHeight} fill="currentColor" className="text-zinc-300">
                  <title>{`${row.label} planned: ${row.plannedSets} sets`}</title>
                </rect>
                <rect x={groupX + barWidth + 2} y={height - padding - completedHeight} width={barWidth} height={completedHeight} fill="currentColor" className="text-zinc-900">
                  <title>{`${row.label} completed: ${row.completedSets} sets`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
        <span className="rounded-full bg-zinc-100 px-3 py-1">Light bar = planned sets</span>
        <span className="rounded-full bg-zinc-100 px-3 py-1">Dark bar = completed sets</span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="text-left text-zinc-500">
              <tr><th className="p-2">Week</th><th className="p-2">Planned</th><th className="p-2">Completed</th><th className="p-2">%</th></tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr key={`${row.label}-table-${index}`} className="border-t border-zinc-100">
                  <td className="p-2 font-medium">{row.label}</td>
                  <td className="p-2">{row.plannedSets}</td>
                  <td className="p-2">{row.completedSets}</td>
                  <td className="p-2">{pct(row.completedSets, row.plannedSets)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="text-left text-zinc-500">
              <tr><th className="p-2">Muscle</th><th className="p-2">Planned</th><th className="p-2">Completed</th><th className="p-2">%</th></tr>
            </thead>
            <tbody>
              {totals.map((row) => (
                <tr key={row.muscle} className="border-t border-zinc-100">
                  <td className="p-2 font-medium">{row.muscle}</td>
                  <td className="p-2">{row.plannedSets}</td>
                  <td className="p-2">{row.completedSets}</td>
                  <td className="p-2">{row.completion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function BlockComparison({ data }) {
  const blocks = Array.from(new Set(data.map((row) => row.block))).sort((a, b) => a - b);

  if (blocks.length < 2) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
        Block comparison will appear after you add at least two blocks. Use Add next block in the workout log controls when you start another 12-week block.
      </div>
    );
  }

  const summaries = blocks.map((block) => {
    const rows = data.filter((row) => row.block === block);
    const workoutsCompleted = rows.reduce((sum, row) => sum + row.workoutsCompleted, 0);
    const workoutsPlanned = rows.reduce((sum, row) => sum + row.workoutsPlanned, 0);
    const workoutCompletionPct = pct(workoutsCompleted, workoutsPlanned);
    const avgExerciseCompletion = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.avgExerciseCompletion, 0) / rows.length) : 0;
    const avgSetCompletion = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.avgSetCompletion, 0) / rows.length) : 0;
    const effortRows = rows.filter((row) => row.avgPerceivedEffort > 0);
    const avgPerceivedEffort = effortRows.length ? Math.round(effortRows.reduce((sum, row) => sum + row.avgPerceivedEffort, 0) / effortRows.length) : 0;
    const readinessRows = rows.filter((row) => row.avgReadiness !== 0);
    const avgReadiness = readinessRows.length ? Math.round((readinessRows.reduce((sum, row) => sum + row.avgReadiness, 0) / readinessRows.length) * 10) / 10 : 0;
    const painEvents = rows.reduce((sum, row) => sum + (row.painEvents ?? 0), 0);
    const injuryStops = rows.reduce((sum, row) => sum + (row.injuryStops ?? 0), 0);

    return {
      block,
      workoutsCompleted,
      workoutsPlanned,
      workoutCompletionPct,
      avgExerciseCompletion,
      avgSetCompletion,
      avgPerceivedEffort,
      avgReadiness,
      painEvents,
      injuryStops
    };
  });

  const first = summaries[0];
  const latest = summaries[summaries.length - 1];
  const delta = (key) => (latest?.[key] ?? 0) - (first?.[key] ?? 0);

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Block comparison</h3>
          <p className="mt-1 text-sm text-zinc-600">Compare training consistency, completion quality, readiness, and pain notes across multiple 12-week blocks.</p>
        </div>
        <div className="text-sm text-zinc-500">Comparing {blocks.length} blocks</div>
      </div>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Workout completion change</span><span className="font-semibold">{delta("workoutCompletionPct") >= 0 ? "+" : ""}{delta("workoutCompletionPct")}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Set completion change</span><span className="font-semibold">{delta("avgSetCompletion") >= 0 ? "+" : ""}{delta("avgSetCompletion")}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Goal effort change</span><span className="font-semibold">{delta("avgPerceivedEffort") >= 0 ? "+" : ""}{delta("avgPerceivedEffort")}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Readiness change</span><span className="font-semibold">{delta("avgReadiness") >= 0 ? "+" : ""}{Math.round(delta("avgReadiness") * 10) / 10}</span></div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="p-2">Block</th>
              <th className="p-2">Workouts</th>
              <th className="p-2">Workout %</th>
              <th className="p-2">Exercise %</th>
              <th className="p-2">Set %</th>
              <th className="p-2">Goal effort</th>
              <th className="p-2">Feel</th>
              <th className="p-2">Pain</th>
              <th className="p-2">Injury stops</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.block} className="border-t border-zinc-100">
                <td className="p-2 font-medium">Block {summary.block}</td>
                <td className="p-2">{summary.workoutsCompleted}/{summary.workoutsPlanned}</td>
                <td className="p-2">{summary.workoutCompletionPct}%</td>
                <td className="p-2">{summary.avgExerciseCompletion}%</td>
                <td className="p-2">{summary.avgSetCompletion}%</td>
                <td className="p-2">{summary.avgPerceivedEffort || "—"}%</td>
                <td className="p-2">{summary.avgReadiness > 0 ? "+" : ""}{summary.avgReadiness || "—"}</td>
                <td className="p-2">{summary.painEvents}</td>
                <td className="p-2">{summary.injuryStops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ConsistencyChart({ data }) {
  const width = 760;
  const height = 260;
  const padding = 38;
  const chartHeight = height - padding * 2;
  const barGroupWidth = (width - padding * 2) / data.length;
  const metrics = [
    { key: "workoutCompletionPct", label: "Workouts done" },
    { key: "avgExerciseCompletion", label: "Exercises completed" },
    { key: "avgSetCompletion", label: "Sets logged" },
    { key: "avgPerceivedEffort", label: "Goal effort" }
  ];
  const latestCompleted = data.reduce((sum, w) => sum + w.workoutsCompleted, 0);
  const latestPlanned = data.reduce((sum, w) => sum + w.workoutsPlanned, 0);
  const overallWorkoutPct = pct(latestCompleted, latestPlanned);
  const overallExercisePct = data.length ? Math.round(data.reduce((sum, w) => sum + w.avgExerciseCompletion, 0) / data.length) : 0;
  const overallSetPct = data.length ? Math.round(data.reduce((sum, w) => sum + w.avgSetCompletion, 0) / data.length) : 0;
  const effortWeeks = data.filter((w) => w.avgPerceivedEffort > 0);
  const overallEffortPct = effortWeeks.length ? Math.round(effortWeeks.reduce((sum, w) => sum + w.avgPerceivedEffort, 0) / effortWeeks.length) : 0;
  const totalPainEvents = data.reduce((sum, w) => sum + (w.painEvents ?? 0), 0);
  const totalInjuryStops = data.reduce((sum, w) => sum + (w.injuryStops ?? 0), 0);
  const readinessWeeks = data.filter((w) => w.avgReadiness !== 0);
  const overallReadiness = readinessWeeks.length
    ? Math.round((readinessWeeks.reduce((sum, w) => sum + w.avgReadiness, 0) / readinessWeeks.length) * 10) / 10
    : 0;

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="mb-3 grid gap-2 text-sm md:grid-cols-7">
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Workouts done</span><span className="font-semibold">{overallWorkoutPct}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Exercises completed</span><span className="font-semibold">{overallExercisePct}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Sets logged</span><span className="font-semibold">{overallSetPct}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Goal effort</span><span className="font-semibold">{overallEffortPct}%</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Pain notes</span><span className="font-semibold">{totalPainEvents}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Injury stops</span><span className="font-semibold">{totalInjuryStops}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Feel vs baseline</span><span className="font-semibold">{overallReadiness > 0 ? "+" : ""}{overallReadiness}</span></div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] rounded-xl bg-zinc-50">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <text x={padding - 26} y={padding + 4} fontSize="11" className="fill-zinc-500">100%</text>
          <text x={padding - 20} y={height - padding + 4} fontSize="11" className="fill-zinc-500">0%</text>
          {data.map((week, weekIndex) => {
            const groupX = padding + weekIndex * barGroupWidth + 6;
            const barWidth = Math.max(6, (barGroupWidth - 12) / metrics.length);
            return (
              <g key={week.week}>
                {metrics.map((metric, metricIndex) => {
                  const rawValue = week[metric.key] ?? 0;
                  const value = Math.min(125, rawValue);
                  const barHeight = Math.min(100, value) / 100 * chartHeight;
                  const x = groupX + metricIndex * barWidth;
                  const y = height - padding - barHeight;
                  return (
                    <rect key={metric.key} x={x} y={y} width={barWidth - 1} height={barHeight} fill="currentColor" className={metricIndex % 2 === 0 ? "text-zinc-900" : "text-zinc-500"}>
                      <title>{`Week ${week.week} · ${metric.label}: ${rawValue}%`}</title>
                    </rect>
                  );
                })}
                <text x={groupX + barGroupWidth / 2 - 6} y={height - 10} textAnchor="middle" fontSize="10" className="fill-zinc-500">{week.label ?? `W${week.week}`}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
        {metrics.map((metric, i) => <span key={metric.key} className="rounded-full bg-zinc-100 px-3 py-1">{i + 1}. {metric.label}</span>)}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-zinc-500">
            <tr><th className="p-2">Week</th><th className="p-2">Workouts</th><th className="p-2">Exercises</th><th className="p-2">Sets</th><th className="p-2">Goal effort</th><th className="p-2">Feel vs baseline</th><th className="p-2">Pain / injury</th></tr>
          </thead>
          <tbody>
            {data.map((w) => (
              <tr key={w.week} className="border-t border-zinc-100">
                <td className="p-2 font-medium">{w.label ?? `Week ${w.week}`}</td>
                <td className="p-2">{w.workoutsCompleted}/{w.workoutsPlanned} · {w.workoutCompletionPct}%</td>
                <td className="p-2">{w.avgExerciseCompletion}%</td>
                <td className="p-2">{w.avgSetCompletion}%</td>
                <td className="p-2">{w.avgPerceivedEffort || "—"}%</td>
                <td className="p-2">{w.avgReadiness > 0 ? "+" : ""}{w.avgReadiness || "—"}</td>
                <td className="p-2">{w.painEvents ? `${w.painEvents} pain note${w.painEvents === 1 ? "" : "s"}` : "Clear"}{w.injuryStops ? ` · ${w.injuryStops} stop${w.injuryStops === 1 ? "" : "s"}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExerciseHistory({ exercise, data }) {
  if (!data.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500">
        No history yet for {exercise}. Log this exercise in a workout occurrence to build its history page.
      </div>
    );
  }

  const bestWeight = Math.max(...data.map((d) => d.weight || 0));
  const bestVolume = Math.max(...data.map((d) => d.volume || 0));
  const bestReps = Math.max(...data.map((d) => d.reps || 0));
  const painCount = data.filter((d) => d.painStatus && d.painStatus !== "No pain").length;
  const latest = data[data.length - 1];

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exercise history: {exercise}</h3>
          <p className="mt-1 text-sm text-zinc-600">Review every logged occurrence, including performance, readiness, pain/injury notes, and next-step notes.</p>
        </div>
        <div className="text-sm text-zinc-500">Latest: {latest?.label} · {latest?.date}</div>
      </div>

      <div className="mt-4 grid gap-2 text-sm md:grid-cols-4">
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Best weight</span><span className="font-semibold">{bestWeight || "—"}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Best total reps</span><span className="font-semibold">{bestReps || "—"}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Best volume</span><span className="font-semibold">{Math.round(bestVolume) || "—"}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Pain/injury notes</span><span className="font-semibold">{painCount}</span></div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="p-2">Occurrence</th>
              <th className="p-2">Date</th>
              <th className="p-2">Weight</th>
              <th className="p-2">Goal</th>
              <th className="p-2">Reps</th>
              <th className="p-2">RIR</th>
              <th className="p-2">Volume</th>
              <th className="p-2">Feel</th>
              <th className="p-2">Pain</th>
              <th className="p-2">Next / notes</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.label}-${i}`} className="border-t border-zinc-100 align-top">
                <td className="p-2 font-medium">{d.label}</td>
                <td className="p-2">{d.date}</td>
                <td className="p-2">{d.weight || "—"}</td>
                <td className="p-2">{d.targetWeight || "—"}</td>
                <td className="p-2">{d.rawReps || "—"}</td>
                <td className="p-2">{d.rir || "—"}</td>
                <td className="p-2">{Math.round(d.volume) || "—"}</td>
                <td className="p-2">{Number(d.readiness) > 0 ? "+" : ""}{d.readiness || "0"}</td>
                <td className="p-2">
                  <div>{d.painStatus || "No pain"}</div>
                  {d.painNotes && <div className="mt-1 text-xs text-zinc-500">{d.painNotes}</div>}
                </td>
                <td className="p-2">
                  {d.next && <div><span className="font-medium">Next:</span> {d.next}</div>}
                  {d.notes && <div className="mt-1 text-xs text-zinc-500">{d.notes}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TrendChart({ data, metric }) {
  if (!data.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
        No trend data yet. Log this exercise in two or more occurrences to see progression.
      </div>
    );
  }

  const width = 760;
  const height = 240;
  const padding = 36;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : padding + i * xStep;
    const y = height - padding - ((d.value - min) / range) * (height - padding * 2);
    return { ...d, x, y };
  });
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const first = data[0]?.value ?? 0;
  const latest = data[data.length - 1]?.value ?? 0;
  const change = latest - first;
  const changePct = first ? Math.round((change / first) * 100) : 0;

  return (
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="mb-3 grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">First</span><span className="font-semibold">{Math.round(first)}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Latest</span><span className="font-semibold">{Math.round(latest)}</span></div>
        <div className="rounded-xl bg-zinc-50 p-3"><span className="block text-zinc-500">Change</span><span className="font-semibold">{change >= 0 ? "+" : ""}{Math.round(change)} ({changePct >= 0 ? "+" : ""}{changePct}%)</span></div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] rounded-xl bg-zinc-50">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-zinc-300" />
          <text x={padding} y={padding - 10} fontSize="12" className="fill-zinc-500">{Math.round(max)}</text>
          <text x={padding} y={height - padding + 18} fontSize="12" className="fill-zinc-500">{Math.round(min)}</text>
          {points.length > 1 && <polyline points={line} fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-900" />}
          {points.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <circle cx={p.x} cy={p.y} r="5" fill="currentColor" className="text-zinc-900" />
              
              <title>{`${p.label} · ${p.date} · ${metric}: ${Math.round(p.value)} · Weight: ${p.weight || "—"} · Reps: ${p.rawReps || "—"}`}</title>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-zinc-500">
            <tr><th className="p-2">Occurrence</th><th className="p-2">Date</th><th className="p-2">Weight</th><th className="p-2">Reps</th><th className="p-2">Volume</th></tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.label}-${i}`} className="border-t border-zinc-100">
                <td className="p-2 font-medium">{d.label}</td>
                <td className="p-2">{d.date}</td>
                <td className="p-2">{d.weight || "—"}</td>
                <td className="p-2">{d.rawReps || "—"}</td>
                <td className="p-2">{Math.round(d.volume)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Metric({ title, value, sub, icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between text-zinc-500">
          <span className="text-sm font-medium">{title}</span>
          {icon}
        </div>
        <div className="text-3xl font-bold">{value}</div>
        <div className="mt-1 text-sm text-zinc-500">{sub}</div>
      </CardContent>
    </Card>
  );
}
