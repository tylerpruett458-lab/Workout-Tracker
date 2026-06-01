import React from "react";
import { CheckCircle2, CalendarDays, Dumbbell, TrendingUp } from "lucide-react";
import { Metric } from "./Analytics";
import { blockLabel, pct } from "../utils/training";

export default function MetricsSummary({
  completedTrainingDays,
  totalTrainingDays,
  state,
  planCalendar,
  activeSession,
  plannedTrainingDays,
  trainingFrequencyPct
}) {
  return (
    <section className="grid gap-4 md:grid-cols-5">
      <Metric title="Training days" value={`${completedTrainingDays}/${totalTrainingDays}`} sub={`${pct(completedTrainingDays, totalTrainingDays)}% complete`} icon={<CheckCircle2 className="h-5 w-5" />} />
      <Metric title="Current block" value={blockLabel(state.activeBlock)} sub={`${state.dataScope} view`} icon={<CalendarDays className="h-5 w-5" />} />
      <Metric title="Current week" value={`Week ${state.activeWeek}`} sub={`${planCalendar.length} week plan`} icon={<CalendarDays className="h-5 w-5" />} />
      <Metric title="Current day" value={`Day ${state.activeDay}`} sub={activeSession} icon={<Dumbbell className="h-5 w-5" />} />
      <Metric title="Training frequency" value={`${plannedTrainingDays}/8`} sub={`${trainingFrequencyPct}% training days per 8-day rotation`} icon={<TrendingUp className="h-5 w-5" />} />
    </section>
  );
}
