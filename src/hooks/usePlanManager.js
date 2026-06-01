import { DEFAULT_PLAN, PLAN_TEMPLATE, PDF_DEFAULT_PLANS } from "../data/defaultPlans";
import { defaultState } from "../utils/training";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileSafeName(name, fallback = "workout-plan") {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
}

function validatePlan(plan) {
  const warnings = [];
  if (!plan || typeof plan !== "object") warnings.push("Plan file is not a valid object.");
  if (!plan?.calendar || !Array.isArray(plan.calendar)) warnings.push("Missing calendar array.");
  if (!plan?.sessions || typeof plan.sessions !== "object") warnings.push("Missing sessions object.");

  const sessionNames = Object.keys(plan?.sessions ?? {});
  if (!sessionNames.length) warnings.push("No workout sessions found.");

  for (const [sessionName, exercises] of Object.entries(plan?.sessions ?? {})) {
    if (!Array.isArray(exercises)) warnings.push(`${sessionName} must be an array of exercises.`);
    else if (!exercises.length) warnings.push(`${sessionName} has no exercises.`);
    else exercises.forEach((exercise, index) => {
      if (!exercise.exercise) warnings.push(`${sessionName} exercise ${index + 1} is missing an exercise name.`);
      if (!exercise.muscle) warnings.push(`${sessionName} exercise ${index + 1} is missing a muscle group.`);
      if (!exercise.setsReps) warnings.push(`${sessionName} exercise ${index + 1} is missing sets/reps.`);
    });
  }

  (plan?.calendar ?? []).forEach((week, weekIndex) => {
    if (!Array.isArray(week)) {
      warnings.push(`Week ${weekIndex + 1} is not an array.`);
      return;
    }
    if (week.length !== 7) warnings.push(`Week ${weekIndex + 1} does not have exactly 7 days.`);
    week.forEach((day, dayIndex) => {
      if (day !== "Rest" && !sessionNames.includes(day)) {
        warnings.push(`Week ${weekIndex + 1}, Day ${dayIndex + 1} uses unknown session: ${day}`);
      }
    });
  });

  return warnings;
}

function summarizePlan(plan) {
  const sessionNames = Object.keys(plan.sessions ?? {});
  const totalExercises = Object.values(plan.sessions ?? {}).reduce((sum, exercises) => sum + (Array.isArray(exercises) ? exercises.length : 0), 0);
  const trainingDays = (plan.calendar ?? []).flat().filter((day) => day !== "Rest").length;
  const restDays = (plan.calendar ?? []).flat().filter((day) => day === "Rest").length;
  return [
    `Plan name: ${plan.planName ?? "Unnamed plan"}`,
    `Weeks: ${(plan.calendar ?? []).length || plan.weeks || "Unknown"}`,
    `Sessions: ${sessionNames.join(", ") || "None"}`,
    `Total exercises: ${totalExercises}`,
    `Training days: ${trainingDays}`,
    `Rest days: ${restDays}`
  ];
}

function makeUniquePlanName(baseName, savedPlans = [], excludeId = "") {
  const cleanBase = (baseName || "Saved Plan").trim() || "Saved Plan";
  const existingNames = new Set(
    savedPlans
      .filter((item) => item.id !== excludeId)
      .map((item) => String(item.name ?? "").toLowerCase())
  );
  if (!existingNames.has(cleanBase.toLowerCase())) return cleanBase;

  let counter = 2;
  let candidate = `${cleanBase} (${counter})`;
  while (existingNames.has(candidate.toLowerCase())) {
    counter += 1;
    candidate = `${cleanBase} (${counter})`;
  }
  return candidate;
}

function resetPlanProgressFields() {
  return {
    activeWeek: 1,
    activeDay: 1,
    activeBlock: 1,
    blockCount: 1,
    dataScope: "Current block",
    needsBackup: true,
    backupExportedAt: null
  };
}

export function usePlanManager({ state, setState }) {
  const activePlanKey = state.activePlanKey ?? (state.selectedSavedPlanId ? `saved:${state.selectedSavedPlanId}` : state.customPlan ? "custom" : "default");
  const activeSavedPlan = activePlanKey.startsWith("saved:")
    ? (state.savedPlans ?? []).find((item) => item.id === activePlanKey.replace("saved:", ""))
    : null;
  const activePdfPlan = activePlanKey.startsWith("pdf:") ? PDF_DEFAULT_PLANS[activePlanKey.replace("pdf:", "")] : null;
  const activePlan = activePlanKey === "default"
    ? DEFAULT_PLAN
    : activeSavedPlan?.plan ?? activePdfPlan ?? state.customPlan ?? DEFAULT_PLAN;
  const planName = activePlan.planName ?? "Custom Workout Plan";

  function activatePlan(value) {
    if (value === "default") {
      setState((prev) => ({
        ...prev,
        customPlan: null,
        selectedSavedPlanId: "",
        activePlanKey: "default",
        ...resetPlanProgressFields()
      }));
      return;
    }

    if (value.startsWith("pdf:")) {
      const key = value.replace("pdf:", "");
      if (!PDF_DEFAULT_PLANS[key]) return;
      setState((prev) => ({
        ...prev,
        customPlan: null,
        selectedSavedPlanId: "",
        activePlanKey: value,
        ...resetPlanProgressFields()
      }));
      return;
    }

    if (value.startsWith("saved:")) {
      const savedId = value.replace("saved:", "");
      const saved = (state.savedPlans ?? []).find((item) => item.id === savedId);
      if (!saved) return;
      setState((prev) => ({
        ...prev,
        customPlan: null,
        selectedSavedPlanId: savedId,
        activePlanKey: value,
        ...resetPlanProgressFields()
      }));
    }
  }

  function exportPlan() {
    downloadJson(`${fileSafeName(planName)}.json`, activePlan);
  }

  function downloadPlanTemplate() {
    downloadJson("workout-plan-template.json", PLAN_TEMPLATE);
  }

  function importPlan(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const plan = parsed.plan ?? parsed;
        const warnings = validatePlan(plan);
        if (warnings.some((warning) => warning.includes("Missing") || warning.includes("not a valid"))) {
          alert(["Plan import failed:", "", ...warnings].join("\n"));
          return;
        }

        const preview = summarizePlan(plan);
        const warningLines = warnings.length
          ? ["", "Warnings:", ...warnings.slice(0, 12), ...(warnings.length > 12 ? ["..."] : [])]
          : [];
        const shouldApply = window.confirm([
          "Import this workout plan?",
          "",
          ...preview,
          ...warningLines,
          "",
          "This changes the active plan but does not delete existing progress logs."
        ].join("\n"));
        if (!shouldApply) return;

        setState((prev) => ({
          ...prev,
          customPlan: plan,
          activePlanKey: "custom",
          selectedSavedPlanId: "",
          ...resetPlanProgressFields()
        }));
      } catch {
        alert("Could not import this plan. Use a valid workout plan JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function exportPlanWithEmptyProgress() {
    const emptyState = {
      ...defaultState(),
      customPlan: activePlan,
      activePlanKey: "custom",
      needsBackup: false,
      backupExportedAt: new Date().toISOString()
    };
    downloadJson(`${fileSafeName(planName)}-empty-progress.json`, { exportedAt: new Date().toISOString(), state: emptyState });
  }

  function duplicateCurrentPlan() {
    const copy = JSON.parse(JSON.stringify(activePlan));
    copy.planName = `${copy.planName ?? "Workout Plan"} Copy`;
    setState((prev) => ({
      ...prev,
      customPlan: copy,
      activePlanKey: "custom",
      selectedSavedPlanId: "",
      needsBackup: true,
      backupExportedAt: null
    }));
  }

  function saveCurrentPlanToLibrary(planToSave = activePlan) {
    const suggestedName = planToSave?.planName ?? planName;
    const name = window.prompt("Save this plan as:", suggestedName);
    if (!name) return;
    const requestedName = name.trim();
    if (!requestedName) return;
    const id = `plan-${Date.now()}`;
    setState((prev) => {
      const uniqueName = makeUniquePlanName(requestedName, prev.savedPlans ?? []);
      const planCopy = JSON.parse(JSON.stringify({ ...planToSave, planName: uniqueName }));
      alert(
        uniqueName === requestedName
          ? `Saved ${uniqueName}. Select it from the Workout plan dropdown when you want to use it.`
          : `A plan named ${requestedName} already existed, so this was saved as ${uniqueName}. Select it from the Workout plan dropdown when you want to use it.`
      );
      return {
        ...prev,
        savedPlans: [...(prev.savedPlans ?? []), { id, name: uniqueName, plan: planCopy, savedAt: new Date().toISOString() }],
        needsBackup: true,
        backupExportedAt: null
      };
    });
  }

  function updateSavedPlanFromCurrent(planToSave = activePlan, planId = state.selectedSavedPlanId) {
    if (!planId) {
      alert("Choose a saved plan first, then you can update it.");
      return;
    }
    const planCopy = JSON.parse(JSON.stringify(planToSave));
    setState((prev) => {
      const uniqueName = makeUniquePlanName(planCopy.planName ?? "Saved Plan", prev.savedPlans ?? [], planId);
      planCopy.planName = uniqueName;
      return {
        ...prev,
        savedPlans: (prev.savedPlans ?? []).map((item) =>
          item.id === planId
            ? { ...item, name: uniqueName, plan: planCopy, savedAt: new Date().toISOString() }
            : item
        ),
        needsBackup: true,
        backupExportedAt: null
      };
    });
    alert("Saved plan updated. Select it from the Workout plan dropdown to use the updated version.");
  }

  function loadSavedPlanIntoBuilder(planId) {
    const saved = (state.savedPlans ?? []).find((item) => item.id === planId);
    if (!saved) return null;
    return JSON.parse(JSON.stringify(saved.plan));
  }

  function deleteSavedPlanById(planId) {
    const saved = (state.savedPlans ?? []).find((item) => item.id === planId);
    if (!saved) {
      alert("That saved plan could not be found.");
      return;
    }
    if (!window.confirm(`Delete saved plan ${saved.name}?`)) return;
    setState((prev) => ({
      ...prev,
      savedPlans: (prev.savedPlans ?? []).filter((item) => item.id !== planId),
      selectedSavedPlanId: prev.selectedSavedPlanId === planId ? "" : prev.selectedSavedPlanId,
      activePlanKey: prev.activePlanKey === `saved:${planId}` ? "default" : prev.activePlanKey,
      customPlan: prev.activePlanKey === `saved:${planId}` ? null : prev.customPlan,
      needsBackup: true,
      backupExportedAt: null
    }));
  }

  function resetPlan() {
    if (window.confirm("Return to the default Upper/Lower plan? Your progress logs will remain saved, but the active plan will reset.")) {
      setState((prev) => ({
        ...prev,
        customPlan: null,
        selectedSavedPlanId: "",
        activePlanKey: "default",
        ...resetPlanProgressFields()
      }));
    }
  }

  return {
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
  };
}
