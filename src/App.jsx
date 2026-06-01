import React, { useState } from "react";
import { Card, CardContent } from "./components/ui";
import AppHeader from "./components/AppHeader";
import MobileLoggingMode from "./components/MobileLoggingMode";
import CardioTracker from "./components/CardioTracker";
import MetricsSummary from "./components/MetricsSummary";
import PlanSelectorCard from "./components/PlanSelectorCard";
import PlanBuilder from "./components/PlanBuilder";
import ScheduleOverview from "./components/ScheduleOverview";
import WorkoutLog from "./components/WorkoutLog";
import AnalyticsSections from "./components/AnalyticsSections";
import { useTrackerState } from "./hooks/useTrackerState";
import { usePlanManager } from "./hooks/usePlanManager";
import { useTrackerDerivedData } from "./hooks/useTrackerDerivedData";
import { dateKey, displayDate, occurrenceDate, sessionForDay, sessionId } from "./utils/training";

const STORAGE_KEY = "workout_mesocycle_tracker_v2";

export default function WorkoutMesocycleTracker() {
  const [trendExercise, setTrendExercise] = useState("Barbell Bench Press");
  const [trendMetric, setTrendMetric] = useState("Estimated volume");

  const {
    state,
    setState,
    updateState,
    updateNested,
    updateExerciseLog,
    exportData,
    importData,
    resetProgress
  } = useTrackerState(STORAGE_KEY);

  const {
    activePlanKey,
    activePlan,
    planName,
    activatePlan,
    exportPlan,
    importPlan,
    exportPlanWithEmptyProgress,
    downloadPlanTemplate,
    duplicateCurrentPlan,
    resetPlan,
    saveCurrentPlanToLibrary,
    updateSavedPlanFromCurrent,
    loadSavedPlanIntoBuilder,
    deleteSavedPlanById
  } = usePlanManager({ state, setState });

  const {
    planCalendar,
    planSessions,
    blockLengthDays,
    totalTrainingDays,
    completedTrainingDays,
    activeSession,
    activeOccurrenceId,
    activeDate,
    plannedTrainingDays,
    trainingFrequencyPct,
    sessionCounts,
    allExerciseNames,
    trendData,
    consistencyData,
    muscleVolumeData
  } = useTrackerDerivedData({ state, activePlan, trendExercise, trendMetric });

  const isAdvancedMode = state.viewMode === "advanced";

  function getScheduledTrainingDaysForActiveBlock() {
    return planCalendar.flatMap((week, wi) =>
      week.map((plannedSession, di) => {
        const id = sessionId(wi, di, state.activeBlock);
        const session = sessionForDay(state, wi, di, state.activeBlock, planCalendar);
        const date = occurrenceDate(state, wi, di, state.activeBlock, blockLengthDays);
        return { week: wi + 1, day: di + 1, id, session, date, index: wi * 7 + di };
      }).filter((day) => day.session !== "Rest")
    );
  }

  function getNextIncompleteWorkout() {
    const days = getScheduledTrainingDaysForActiveBlock();
    if (!days.length) return null;
    const currentIndex = (state.activeWeek - 1) * 7 + (state.activeDay - 1);
    const ordered = [
      ...days.filter((d) => d.index >= currentIndex),
      ...days.filter((d) => d.index < currentIndex)
    ];
    return ordered.find((d) => !state.completedDays[d.id]) ?? null;
  }

  const nextIncompleteWorkout = getNextIncompleteWorkout();
  const lastLoggedWorkout = [...getScheduledTrainingDaysForActiveBlock()]
    .filter((day) => state.completedDays[day.id])
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] ?? null;
  const painFlagsThisBlock = Object.entries(state.exerciseLog ?? {}).filter(([id, log]) =>
    id.startsWith(`c${state.activeBlock}-`) && log?.painStatus && log.painStatus !== "No pain"
  ).length;

  function goToNextIncompleteWorkout() {
    if (!nextIncompleteWorkout) {
      alert("All scheduled workouts in the current block are marked complete, or no training days are scheduled.");
      return;
    }
    updateState({ activeWeek: nextIncompleteWorkout.week, activeDay: nextIncompleteWorkout.day });
  }

  function goToTodayWorkout() {
    const today = dateKey(new Date());
    for (let wi = 0; wi < planCalendar.length; wi += 1) {
      for (let di = 0; di < 7; di += 1) {
        const date = occurrenceDate(state, wi, di, state.activeBlock, blockLengthDays);
        if (date === today) {
          updateState({ activeWeek: wi + 1, activeDay: di + 1 });
          return;
        }
      }
    }
    alert("Today is not inside the current block schedule. Check your mesocycle start date or active block.");
  }

  const quickStatus = {
    completion: `${completedTrainingDays}/${totalTrainingDays} workouts complete`,
    lastLogged: lastLoggedWorkout ? `${lastLoggedWorkout.session} · ${displayDate(lastLoggedWorkout.date)}` : "No completed workouts yet",
    nextWorkout: nextIncompleteWorkout ? `${nextIncompleteWorkout.session} · ${displayDate(nextIncompleteWorkout.date)}` : "All workouts complete",
    painFlags: `${painFlagsThisBlock} pain flag${painFlagsThisBlock === 1 ? "" : "s"} this block`
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 text-zinc-950 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AppHeader
          planName={planName}
          planSessions={planSessions}
          exportData={exportData}
          importData={importData}
          exportPlan={exportPlan}
          importPlan={importPlan}
          exportPlanWithEmptyProgress={exportPlanWithEmptyProgress}
          downloadPlanTemplate={downloadPlanTemplate}
          duplicateCurrentPlan={duplicateCurrentPlan}
          resetPlan={resetPlan}
          resetProgress={resetProgress}
        />

        <MetricsSummary
          completedTrainingDays={completedTrainingDays}
          totalTrainingDays={totalTrainingDays}
          state={state}
          planCalendar={planCalendar}
          activeSession={activeSession}
          plannedTrainingDays={plannedTrainingDays}
          trainingFrequencyPct={trainingFrequencyPct}
        />

        <PlanSelectorCard
          state={state}
          activePlanKey={activePlanKey}
          planName={planName}
          updateState={updateState}
          selectBuiltInPlan={activatePlan}
          onNextIncompleteWorkout={goToNextIncompleteWorkout}
          onGoToToday={goToTodayWorkout}
          quickStatus={quickStatus}
        />

        <ScheduleOverview
          state={state}
          planCalendar={planCalendar}
          planSessions={planSessions}
          blockLengthDays={blockLengthDays}
          sessionCounts={sessionCounts}
          updateNested={updateNested}
        />

        <details className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <summary className="cursor-pointer select-none text-lg font-semibold text-emerald-800">EZ Mobile Log</summary>
          <div className="mt-3">
            <MobileLoggingMode
              sessionName={activeSession}
              activeOccurrenceId={activeOccurrenceId}
              activeDate={activeDate}
              exercises={planSessions[activeSession] ?? []}
              state={state}
              updateExerciseLog={updateExerciseLog}
              updateNested={updateNested}
            />
          </div>
        </details>

        <CardioTracker
          state={state}
          activeDate={activeDate}
          updateNested={updateNested}
          updateState={updateState}
        />

        <Card>
          <CardContent className="flex flex-col gap-4 p-4 md:p-5">
            <WorkoutLog
              state={state}
              planCalendar={planCalendar}
              planSessions={planSessions}
              activeSession={activeSession}
              activeOccurrenceId={activeOccurrenceId}
              activeDate={activeDate}
              updateState={updateState}
              updateNested={updateNested}
              updateExerciseLog={updateExerciseLog}
              setTrendExercise={setTrendExercise}
            />

            {isAdvancedMode && (
              <>
                <details className="order-2 rounded-2xl bg-zinc-100 p-4">
                  <summary className="cursor-pointer select-none text-lg font-semibold">Plan builder</summary>
                  <div className="mt-3">
                    <PlanBuilder
                      plan={activePlan}
                      savedPlans={state.savedPlans ?? []}
                      selectedSavedPlanId={state.selectedSavedPlanId ?? ""}
                      onSavePlan={saveCurrentPlanToLibrary}
                      onUpdateSavedPlan={updateSavedPlanFromCurrent}
                      onLoadSavedPlan={loadSavedPlanIntoBuilder}
                      onDeleteSavedPlanById={deleteSavedPlanById}
                    />
                  </div>
                </details>

                <AnalyticsSections
                  muscleVolumeData={muscleVolumeData}
                  consistencyData={consistencyData}
                  allExerciseNames={allExerciseNames}
                  trendExercise={trendExercise}
                  setTrendExercise={setTrendExercise}
                  trendMetric={trendMetric}
                  setTrendMetric={setTrendMetric}
                  trendData={trendData}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
