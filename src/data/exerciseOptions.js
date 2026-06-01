export const COMMON_EXERCISES_BY_MUSCLE = {
  Chest: [
    "Barbell Bench Press",
    "Dumbbell Bench Press",
    "Incline Dumbbell Press",
    "Incline Barbell Press",
    "Machine Chest Press",
    "Smith Machine Incline Press",
    "Machine Pec Fly",
    "Cable Fly",
    "Weighted Dip",
    "Push-Up"
  ],
  Shoulders: [
    "Barbell Strict Press",
    "Seated Dumbbell Shoulder Press",
    "Machine Shoulder Press",
    "Machine Lateral Raise",
    "Cable Lateral Raise",
    "Dumbbell Lateral Raise",
    "Reverse Pec Deck",
    "Face Pull",
    "Rear Delt Cable Fly",
    "Upright Row"
  ],
  Triceps: [
    "Cable Triceps Pushdown",
    "Overhead Cable Triceps Extension",
    "Single-Arm Cable Triceps Extension",
    "Skull Crusher",
    "Close-Grip Bench Press",
    "Machine Dip",
    "Rope Pushdown",
    "Cross-Body Cable Extension"
  ],
  Biceps: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Incline Dumbbell Curl",
    "Seated Pyramid Curls",
    "Cable Curl",
    "Preacher Curl",
    "Machine Curl",
    "Hammer Curl"
  ],
  Forearms: [
    "Wrist Curl",
    "Reverse Wrist Curl",
    "Farmer’s Carry",
    "Plate Pinch",
    "Reverse Curl",
    "Dead Hang"
  ],
  "Upper Back": [
    "Face Pull",
    "Reverse Pec Deck",
    "Machine Shrug",
    "Cable Rear Delt Row",
    "Chest-Supported Rear Delt Row",
    "Barbell Shrug"
  ],
  "Mid Back": [
    "Chest-Supported Machine Row",
    "Seated Cable Row",
    "Machine Row",
    "Chest-Supported Dumbbell Row",
    "T-Bar Row",
    "Barbell Row",
    "Single-Arm Dumbbell Row"
  ],
  "Lower Back": [
    "Romanian Deadlift",
    "Machine Back Extension",
    "Reverse Hyperextension",
    "Back Extension",
    "Good Morning",
    "Rack Pull"
  ],
  Lats: [
    "Lat Pulldown",
    "Single-Arm Cable Lat Pulldown",
    "Straight-Arm Cable Pulldown",
    "Pull-Up",
    "Assisted Pull-Up",
    "Neutral-Grip Pulldown",
    "Machine Pullover"
  ],
  Quads: [
    "Belt Squat",
    "Hack Squat Machine",
    "Leg Press",
    "Leg Extension",
    "Front Squat",
    "High-Bar Back Squat",
    "Smith Machine Squat",
    "Bulgarian Split Squat"
  ],
  Hamstrings: [
    "Seated Leg Curl",
    "Lying Leg Curl",
    "Nordic Curl or Assisted Nordic Curl",
    "Romanian Deadlift",
    "Single-Leg Romanian Deadlift",
    "Glute-Ham Raise",
    "Cable Pull-Through"
  ],
  Glutes: [
    "Hip Thrust Machine",
    "Machine Glute Kickback",
    "Cable Glute Kickback",
    "Barbell Hip Thrust",
    "Glute Bridge",
    "Reverse Lunge",
    "Step-Up"
  ],
  Calves: [
    "Standing Calf Raise Machine",
    "Seated Calf Raise",
    "Donkey Calf Raise or Leg Press Calf Raise",
    "Leg Press Calf Raise",
    "Single-Leg Calf Raise",
    "Smith Machine Calf Raise"
  ],
  "Hip Abductors": [
    "Machine Hip Abduction",
    "Cable Hip Abduction",
    "Seated Hip Abduction Machine",
    "Banded Hip Abduction",
    "Side-Lying Hip Abduction"
  ],
  "Hip Adductors": [
    "Machine Hip Adduction",
    "Cable Hip Adduction",
    "Seated Hip Adduction Machine",
    "Copenhagen Plank",
    "Standing Cable Adduction"
  ],
  Core: [
    "Cable Crunch",
    "Hanging Knee Raise",
    "Plank",
    "Ab Wheel Rollout",
    "Machine Crunch",
    "Decline Sit-Up",
    "Dead Bug",
    "Pallof Press",
    "Side Plank"
  ],
  Back: [
    "Lat Pulldown",
    "Seated Cable Row",
    "Machine Row",
    "Chest-Supported Row",
    "Pull-Up",
    "Barbell Row",
    "T-Bar Row"
  ],
  Legs: [
    "Hack Squat Machine",
    "Leg Press",
    "Romanian Deadlift",
    "Leg Extension",
    "Seated Leg Curl",
    "Standing Calf Raise Machine"
  ],
  Other: [
    "Custom Exercise"
  ]
};

export function commonExercisesForMuscle(muscle) {
  return COMMON_EXERCISES_BY_MUSCLE[muscle] ?? COMMON_EXERCISES_BY_MUSCLE.Other;
}
