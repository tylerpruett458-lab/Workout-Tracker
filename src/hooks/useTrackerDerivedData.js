import { useMemo } from "react";
import { CALENDAR, SESSIONS } from "../data/defaultPlans";
import {
  pct,
  sessionId,
  exerciseId,
  displayDate,
  parsePrescription,
  parseNumber,
  parseReps,
  occurrenceDate,
  sessionForDay
} from "../utils/training";

export function useTrackerDerivedData({ state, activePlan, trendExercise, trendMetric }) {
  const planCalendar = activePlan.calendar ?? CALENDAR;
  const planSessions = activePlan.sessions ?? SESSIONS;
  const planName = activePlan.planName ?? "Custom Workout Plan";
  const blockLengthDays = (planCalendar.length || 12) * 7;

  const scopedTrainingDays = useMemo(() => {
    const blocks = state.dataScope === "All blocks"
      ? Array.from({ length: state.blockCount }, (_, i) => i + 1)
      : [state.activeBlock];

    return blocks.flatMap((block) =>
      planCalendar.flatMap((week, wi) =>
        week.map((plannedSession, di) => {
          const id = sessionId(wi, di, block);
          return {
            block,
            week: wi + 1,
            day: di + 1,
            plannedSession,
            session: sessionForDay(state, wi, di, block, planCalendar),
            id
          };
        })
      )
    );
  }, [state.sessionOverrides, state.activeBlock, state.blockCount, state.dataScope, planCalendar]);

  const totalTrainingDays = scopedTrainingDays.filter((d) => d.session !== "Rest").length;
  const completedTrainingDays = scopedTrainingDays.filter((d) => d.session !== "Rest" && state.completedDays[d.id]).length;
  const activeSession = sessionForDay(state, state.activeWeek - 1, state.activeDay - 1, state.activeBlock, planCalendar);
  const activeOccurrenceId = sessionId(state.activeWeek - 1, state.activeDay - 1, state.activeBlock);
  const activeDate = occurrenceDate(state, state.activeWeek - 1, state.activeDay - 1, state.activeBlock, blockLengthDays);
  const rotationDays = planCalendar.flat().slice(0, 8);
  const plannedTrainingDays = rotationDays.filter((day) => day !== "Rest").length;
  const plannedTotalDays = rotationDays.length || 8;
  const trainingFrequencyPct = pct(plannedTrainingDays, plannedTotalDays);

  const sessionCounts = useMemo(() => {
    const counts = {};
    for (const day of scopedTrainingDays) {
      if (day.session === "Rest") continue;
      counts[day.session] = counts[day.session] ?? { total: 0, done: 0 };
      counts[day.session].total += 1;
      if (state.completedDays[day.id]) counts[day.session].done += 1;
    }
    return counts;
  }, [scopedTrainingDays, state.completedDays]);

  const allExerciseNames = useMemo(() => {
    return Array.from(new Set(Object.values(planSessions).flat().map((e) => e.exercise))).sort((a, b) => a.localeCompare(b));
  }, [planSessions]);

  const trendData = useMemo(() => {
    const points = [];
    for (const day of scopedTrainingDays) {
      if (day.session === "Rest") continue;
      const sessionExercises = planSessions[day.session] ?? [];
      const exercise = sessionExercises.find((e) => e.exercise === trendExercise);
      if (!exercise) continue;
      const id = exerciseId(day.id, day.session, trendExercise);
      const log = state.exerciseLog[id];
      if (!log) continue;
      const weight = parseFloat(String(log.weight ?? "").replace(/[^0-9.]/g, ""));
      const reps = String(log.reps ?? "")
        .split(/[,/ ]+/)
        .map((r) => parseFloat(r))
        .filter((n) => Number.isFinite(n));
      if (!Number.isFinite(weight) && reps.length === 0) continue;
      const totalReps = reps.reduce((sum, n) => sum + n, 0);
      const bestSetReps = reps.length ? Math.max(...reps) : 0;
      const estimatedVolume = Number.isFinite(weight) ? weight * totalReps : totalReps;
      const bestSetWeight = Number.isFinite(weight) ? weight : 0;
      const value =
        trendMetric === "Weight" ? bestSetWeight :
        trendMetric === "Total reps" ? totalReps :
        trendMetric === "Best set reps" ? bestSetReps :
        estimatedVolume;
      points.push({
        label: `B${day.block} W${day.week}D${day.day}`,
        date: displayDate(occurrenceDate(state, day.week - 1, day.day - 1, day.block, blockLengthDays)),
        session: day.session,
        value,
        weight: bestSetWeight,
        reps: totalReps,
        rawReps: log.reps ?? "",
        rir: log.rir ?? "",
        targetWeight: log.targetWeight ?? "",
        next: log.next ?? "",
        notes: log.notes ?? "",
        painStatus: log.painStatus ?? "No pain",
        painNotes: log.painNotes ?? "",
        readiness: state.readiness?.[day.id] ?? "0",
        block: day.block,
        week: day.week,
        day: day.day,
        volume: estimatedVolume
      });
    }
    return points.filter((p) => Number.isFinite(p.value));
  }, [scopedTrainingDays, state.exerciseLog, state.startDate, state.customDates, trendExercise, trendMetric, planSessions, blockLengthDays]);

  const consistencyData = useMemo(() => {
    const blocks = state.dataScope === "All blocks"
      ? Array.from({ length: state.blockCount }, (_, i) => i + 1)
      : [state.activeBlock];

    return blocks.flatMap((block) =>
      planCalendar.map((week, wi) => {
        const training = week
          .map((plannedSession, di) => {
            const id = sessionId(wi, di, block);
            return {
              block,
              session: sessionForDay(state, wi, di, block, planCalendar),
              plannedSession,
              id,
              day: di + 1
            };
          })
          .filter((d) => d.session !== "Rest");

        const workoutsCompleted = training.filter((d) => state.completedDays[d.id]).length;
        const workoutCompletionPct = pct(workoutsCompleted, training.length);
        const readinessValues = training
          .map((d) => Number(state.readiness?.[d.id] ?? 0))
          .filter((n) => Number.isFinite(n) && n !== 0);
        const avgReadiness = readinessValues.length
          ? Math.round((readinessValues.reduce((sum, n) => sum + n, 0) / readinessValues.length) * 10) / 10
          : 0;

        const workoutDetails = training.map((d) => {
          const exercises = planSessions[d.session] ?? [];
          let completedExercises = 0;
          let setCompletionSum = 0;
          let effortSum = 0;
          let effortCount = 0;
          let painEvents = 0;
          let injuryStops = 0;

          for (const exercise of exercises) {
            const log = state.exerciseLog[exerciseId(d.id, d.session, exercise.exercise)] ?? {};
            const reps = parseReps(log.reps);
            const actualWeight = parseNumber(log.weight);
            const targetWeight = parseNumber(log.targetWeight);
            const prescription = parsePrescription(exercise.setsReps);
            const isSkipped = Boolean(log.skipped);
            const hasPain = log.painStatus && log.painStatus !== "No pain";
            if (hasPain) painEvents += 1;
            if (log.painStatus === "Injury / stop") injuryStops += 1;
            const isDone = Boolean(log.done) || reps.length > 0;

            if (isDone && !isSkipped) completedExercises += 1;

            const setPct = isSkipped ? 0 : Math.min(100, Math.round((reps.length / prescription.sets) * 100));
            setCompletionSum += setPct;

            if (!isSkipped && (reps.length > 0 || actualWeight > 0 || targetWeight > 0)) {
              const actualReps = reps.reduce((sum, n) => sum + n, 0);
              const targetReps = prescription.sets * prescription.topReps;
              const repsPct = targetReps ? Math.min(1.25, actualReps / targetReps) : 1;
              const weightPct = targetWeight ? Math.min(1.25, actualWeight / targetWeight) : 1;
              const painModifier = log.painStatus === "Mild pain" ? 0.95 : log.painStatus === "Moderate pain" ? 0.85 : log.painStatus === "Injury / stop" ? 0.65 : 1;
              effortSum += Math.round(Math.min(125, repsPct * weightPct * 100 * painModifier));
              effortCount += 1;
            }
          }

          const exerciseCompletionPct = pct(completedExercises, exercises.length);
          const setCompletionPct = exercises.length ? Math.round(setCompletionSum / exercises.length) : 0;
          const perceivedEffortPct = effortCount ? Math.round(effortSum / effortCount) : 0;
          const painFlag = injuryStops > 0 ? "Injury / stop" : painEvents > 0 ? "Pain noted" : "Clear";
          return { ...d, exerciseCompletionPct, setCompletionPct, perceivedEffortPct, painEvents, injuryStops, painFlag };
        });

        const avgExerciseCompletion = workoutDetails.length ? Math.round(workoutDetails.reduce((sum, d) => sum + d.exerciseCompletionPct, 0) / workoutDetails.length) : 0;
        const avgSetCompletion = workoutDetails.length ? Math.round(workoutDetails.reduce((sum, d) => sum + d.setCompletionPct, 0) / workoutDetails.length) : 0;
        const effortWorkouts = workoutDetails.filter((d) => d.perceivedEffortPct > 0);
        const avgPerceivedEffort = effortWorkouts.length ? Math.round(effortWorkouts.reduce((sum, d) => sum + d.perceivedEffortPct, 0) / effortWorkouts.length) : 0;
        const painEvents = workoutDetails.reduce((sum, d) => sum + d.painEvents, 0);
        const injuryStops = workoutDetails.reduce((sum, d) => sum + d.injuryStops, 0);

        return {
          block,
          week: wi + 1,
          label: state.dataScope === "All blocks" ? `B${block} W${wi + 1}` : `Week ${wi + 1}`,
          workoutCompletionPct,
          avgExerciseCompletion,
          avgSetCompletion,
          avgPerceivedEffort,
          painEvents,
          injuryStops,
          avgReadiness,
          workoutsCompleted,
          workoutsPlanned: training.length
        };
      })
    );
  }, [state.completedDays, state.exerciseLog, state.readiness, state.sessionOverrides, state.activeBlock, state.blockCount, state.dataScope, planCalendar, planSessions]);

  const muscleVolumeData = useMemo(() => {
    const blocks = state.dataScope === "All blocks"
      ? Array.from({ length: state.blockCount }, (_, i) => i + 1)
      : [state.activeBlock];

    return blocks.flatMap((block) =>
      planCalendar.map((week, wi) => {
        const muscles = {};
        week.forEach((plannedSession, di) => {
          const id = sessionId(wi, di, block);
          const session = sessionForDay(state, wi, di, block, planCalendar);
          if (session === "Rest") return;
          const exercises = planSessions[session] ?? [];
          exercises.forEach((exercise) => {
            const log = state.exerciseLog[exerciseId(id, session, exercise.exercise)] ?? {};
            const prescription = parsePrescription(exercise.setsReps);
            const reps = parseReps(log.reps);
            const loggedSets = reps.length;
            const completedSets = log.skipped ? 0 : Math.min(prescription.sets, loggedSets || (log.done ? prescription.sets : 0));
            const plannedSets = prescription.sets;
            const muscle = exercise.muscle || "Other";
            if (!muscles[muscle]) muscles[muscle] = { muscle, plannedSets: 0, completedSets: 0, exercises: 0 };
            muscles[muscle].plannedSets += plannedSets;
            muscles[muscle].completedSets += completedSets;
            muscles[muscle].exercises += 1;
          });
        });
        return {
          block,
          week: wi + 1,
          label: state.dataScope === "All blocks" ? `B${block} W${wi + 1}` : `Week ${wi + 1}`,
          muscles: Object.values(muscles).sort((a, b) => b.completedSets - a.completedSets || a.muscle.localeCompare(b.muscle))
        };
      })
    );
  }, [state.dataScope, state.blockCount, state.activeBlock, state.sessionOverrides, state.exerciseLog, planCalendar, planSessions]);

  return {
    planCalendar,
    planSessions,
    planName,
    blockLengthDays,
    scopedTrainingDays,
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
  };
}
