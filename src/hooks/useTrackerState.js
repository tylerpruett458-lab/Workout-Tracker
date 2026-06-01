import { useEffect, useState } from "react";
import { defaultState } from "../utils/training";

function migrateState(rawState = {}) {
  const migrated = {
    ...defaultState(),
    ...rawState,
    activeBlock: rawState.activeBlock ?? rawState.activeCycle ?? 1,
    blockCount: rawState.blockCount ?? rawState.cycleCount ?? 1,
    dataScope:
      rawState.dataScope === "Current cycle" ? "Current block" :
      rawState.dataScope === "All cycles" ? "All blocks" :
      rawState.dataScope ?? "Current block"
  };

  migrated.activePlanKey = rawState.activePlanKey ?? (
    migrated.selectedSavedPlanId ? `saved:${migrated.selectedSavedPlanId}` :
    migrated.customPlan ? "custom" :
    "default"
  );

  return migrated;
}

function hasMeaningfulSavedData(currentState) {
  const nonEmpty = (obj) => obj && Object.keys(obj).length > 0;
  return Boolean(
    nonEmpty(currentState.completedDays) ||
    nonEmpty(currentState.exerciseLog) ||
    nonEmpty(currentState.cardioLog) ||
    nonEmpty(currentState.cardioImportHistory) ||
    nonEmpty(currentState.bodyweight) ||
    nonEmpty(currentState.notes) ||
    nonEmpty(currentState.customDates) ||
    nonEmpty(currentState.readiness) ||
    nonEmpty(currentState.sessionOverrides) ||
    currentState.customPlan ||
    currentState.startDate ||
    currentState.blockCount > 1
  );
}

export function useTrackerState(storageKey) {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setState(migrateState(parsed));
    } catch {
      setState(defaultState());
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  function markDirty(patch) {
    return { ...patch, needsBackup: true, backupExportedAt: null };
  }

  function updateState(patch) {
    setState((prev) => ({ ...prev, ...markDirty(patch) }));
  }

  function updateNested(key, id, value) {
    setState((prev) => {
      const nextNested = { ...prev[key] };
      if (value === undefined) delete nextNested[id];
      else nextNested[id] = value;
      return { ...prev, [key]: nextNested, needsBackup: true, backupExportedAt: null };
    });
  }

  function updateExerciseLog(id, patch) {
    setState((prev) => ({
      ...prev,
      exerciseLog: {
        ...prev.exerciseLog,
        [id]: { ...(prev.exerciseLog[id] ?? {}), ...patch }
      },
      needsBackup: true,
      backupExportedAt: null
    }));
  }

  function exportData() {
    const exportedAt = new Date().toISOString();
    const stateToExport = { ...state, needsBackup: false, backupExportedAt: exportedAt };
    const blob = new Blob([JSON.stringify({ exportedAt, state: stateToExport }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "workout-mesocycle-progress.json";
    link.click();
    URL.revokeObjectURL(url);
    setState(stateToExport);
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const importedState = migrateState(parsed.state ?? parsed);
        setState({ ...importedState, needsBackup: false, backupExportedAt: new Date().toISOString() });
      } catch {
        alert("Could not import this file. Use an exported workout tracker JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function resetProgress() {
    const hasData = hasMeaningfulSavedData(state);

    if (hasData && state.needsBackup !== false) {
      alert([
        "Reset blocked. Export a backup first so your workout data is not accidentally lost.",
        "",
        "Click Export to download your progress file, then click Reset Progress again."
      ].join("\n"));
      return;
    }

    const warning = [
      "This will permanently erase all saved workout progress in this browser, including:",
      "",
      "• completed workout days",
      "• exercise logs",
      "• weights, reps, RIR, and target weights",
      "• pain/injury notes",
      "• readiness / feel-vs-baseline entries",
      "• custom dates and block data",
      "• cardio logs and Apple Health import history",
      "",
      hasData ? "A backup has been exported since your last tracked change." : "No tracked changes were found, so no backup is required.",
      "",
      "Type RESET to confirm."
    ].join("\n");

    const confirmation = window.prompt(warning);
    if (confirmation !== "RESET") {
      alert("Reset cancelled. No data was deleted.");
      return;
    }

    const finalConfirm = window.confirm("Final warning: delete all workout progress now?");
    if (!finalConfirm) return;

    setState(defaultState());
    localStorage.removeItem(storageKey);
    alert("Workout progress has been reset.");
  }

  return {
    state,
    setState,
    updateState,
    updateNested,
    updateExerciseLog,
    exportData,
    importData,
    resetProgress
  };
}
