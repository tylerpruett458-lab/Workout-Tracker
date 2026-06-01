import React from "react";
import { Download, Upload, RotateCcw, Dumbbell } from "lucide-react";
import { Button } from "./ui";

export default function AppHeader({
  planName,
  planSessions,
  exportData,
  importData,
  exportPlan,
  importPlan,
  exportPlanWithEmptyProgress,
  downloadPlanTemplate,
  duplicateCurrentPlan,
  resetPlan,
  resetProgress
}) {
  const sessionList = Object.keys(planSessions).filter((name) => name !== "Rest").join(" / ") || "Workout Plan";

  return (
    <header className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Dumbbell className="h-4 w-4" /> {planName} · {sessionList}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{planName}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 md:text-base">
            Track the selected split, log loads and reps, manage blocks, and export either progress or the plan itself.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <details className="md:self-start">
            <summary className="cursor-pointer select-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
              Manage backups, plans, and reset
            </summary>
            <div className="mt-3 grid max-w-xl gap-3 rounded-2xl bg-zinc-50 p-3">
              <div className="rounded-2xl bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Backup & Restore</div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button onClick={exportData}><Download className="mr-2 h-4 w-4" /> Export Full Backup</Button>
                  <label className="inline-flex cursor-pointer items-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800">
                    <Upload className="mr-2 h-4 w-4" /> Import Full Backup
                    <input type="file" accept="application/json,.json" onChange={importData} className="hidden" />
                  </label>
                  <Button variant="outline" onClick={resetProgress}><RotateCcw className="mr-2 h-4 w-4" /> Reset Progress</Button>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Plan Sharing</div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={exportPlan}><Download className="mr-2 h-4 w-4" /> Export Active Plan</Button>
                  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50">
                    <Upload className="mr-2 h-4 w-4" /> Import Plan
                    <input type="file" accept="application/json,.json" onChange={importPlan} className="hidden" />
                  </label>
                  <Button variant="outline" onClick={exportPlanWithEmptyProgress}>Export Plan With Empty Progress</Button>
                  <Button variant="outline" onClick={downloadPlanTemplate}>Blank Plan Template</Button>
                  <Button variant="outline" onClick={duplicateCurrentPlan}>Duplicate Plan</Button>
                  <Button variant="outline" onClick={resetPlan}>Default Plan</Button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
