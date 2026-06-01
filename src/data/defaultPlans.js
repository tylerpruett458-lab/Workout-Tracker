export const CALENDAR = [
  ["Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2", "Rest", "Upper Body 3"],
  ["Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2", "Rest"],
  ["Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2"],
  ["Rest", "Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2"],
  ["Lower Body 2", "Rest", "Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest"],
  ["Upper Body 2", "Lower Body 2", "Rest", "Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1"],
  ["Rest", "Upper Body 2", "Lower Body 2", "Rest", "Upper Body 3", "Lower Body 3", "Upper Body 1"],
  ["Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2", "Rest", "Upper Body 3", "Lower Body 3"],
  ["Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2", "Rest", "Upper Body 3"],
  ["Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2", "Rest"],
  ["Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2", "Lower Body 2"],
  ["Rest", "Upper Body 3", "Lower Body 3", "Upper Body 1", "Lower Body 1", "Rest", "Upper Body 2"]
];


export const REST_TIMES = {
  "Heavy compound": "2–3 min",
  "Machine compound": "90–150 sec",
  "Isolation": "60–90 sec",
  "Core": "45–90 sec"
};

export const SESSIONS = {
  "Upper Body 1": [
    { muscle: "Chest", exercise: "Barbell Bench Press", setsReps: "3 x 5–8", type: "Heavy compound" },
    { muscle: "Shoulders", exercise: "Barbell Strict Press", setsReps: "3 x 5–8", type: "Heavy compound" },
    { muscle: "Triceps", exercise: "Cable Triceps Pushdown", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Biceps", exercise: "Barbell Curl", setsReps: "3 x 8–12", type: "Isolation" },
    { muscle: "Forearms", exercise: "Reverse Wrist Curl", setsReps: "2–3 x 12–15", type: "Isolation" },
    { muscle: "Upper Back", exercise: "Face Pull", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Mid Back", exercise: "Chest-Supported Machine Row", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Lower Back", exercise: "Romanian Deadlift", setsReps: "3 x 8–10", type: "Heavy compound" },
    { muscle: "Lats", exercise: "Straight-Arm Cable Pulldown", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Core", exercise: "Cable Crunch", setsReps: "3 x 10–15", type: "Core" }
  ],
  "Lower Body 1": [
    { muscle: "Quads", exercise: "Belt Squat", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Hamstrings", exercise: "Seated Leg Curl", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Glutes", exercise: "Machine Glute Kickback", setsReps: "3 x 10–15 each side", type: "Isolation" },
    { muscle: "Calves", exercise: "Standing Calf Raise Machine", setsReps: "3 x 10–15", type: "Machine compound" },
    { muscle: "Hip Abductors", exercise: "Machine Hip Abduction", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Hip Adductors", exercise: "Machine Hip Adduction", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Core", exercise: "Hanging Knee Raise", setsReps: "3 x 8–15", type: "Core" }
  ],
  "Upper Body 2": [
    { muscle: "Chest", exercise: "Smith Machine Reverse-Grip Incline Press", setsReps: "3 x 6–10", type: "Machine compound" },
    { muscle: "Shoulders", exercise: "Machine Lateral Raise", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Triceps", exercise: "Overhead Cable Triceps Extension", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Biceps", exercise: "Seated Pyramid Curls", setsReps: "3 x 8–12", type: "Isolation" },
    { muscle: "Forearms", exercise: "Wrist Curl", setsReps: "2–3 x 12–20", type: "Isolation" },
    { muscle: "Upper Back", exercise: "Reverse Pec Deck", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Mid Back", exercise: "Seated Cable Row", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Lower Back", exercise: "Machine Back Extension", setsReps: "3 x 10–15", type: "Machine compound" },
    { muscle: "Lats", exercise: "Lat Pulldown", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Core", exercise: "Plank", setsReps: "3 x 30–60 sec", type: "Core" }
  ],
  "Lower Body 2": [
    { muscle: "Quads", exercise: "Leg Extension", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Hamstrings", exercise: "Lying Leg Curl", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Glutes", exercise: "Hip Thrust Machine", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Calves", exercise: "Seated Calf Raise", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Hip Abductors", exercise: "Cable Hip Abduction", setsReps: "3 x 12–15 each side", type: "Isolation" },
    { muscle: "Hip Adductors", exercise: "Cable Hip Adduction", setsReps: "3 x 12–15 each side", type: "Isolation" },
    { muscle: "Core", exercise: "Ab Wheel Rollout", setsReps: "3 x 6–12", type: "Core" }
  ],
  "Upper Body 3": [
    { muscle: "Chest", exercise: "Machine Pec Fly", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Shoulders", exercise: "Cable Lateral Raise", setsReps: "3 x 12–20 each side", type: "Isolation" },
    { muscle: "Triceps", exercise: "Single-Arm Cable Triceps Extension", setsReps: "3 x 10–15 each side", type: "Isolation" },
    { muscle: "Biceps", exercise: "Cable Curl", setsReps: "3 x 10–15", type: "Isolation" },
    { muscle: "Forearms", exercise: "Farmer’s Carry", setsReps: "3 x 30–45 sec", type: "Heavy compound" },
    { muscle: "Upper Back", exercise: "Machine Shrug", setsReps: "3 x 10–15", type: "Machine compound" },
    { muscle: "Mid Back", exercise: "Machine Row", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Lower Back", exercise: "Reverse Hyperextension", setsReps: "3 x 10–15", type: "Machine compound" },
    { muscle: "Lats", exercise: "Single-Arm Cable Lat Pulldown", setsReps: "3 x 10–15 each side", type: "Isolation" },
    { muscle: "Core", exercise: "Machine Crunch", setsReps: "3 x 10–15", type: "Core" }
  ],
  "Lower Body 3": [
    { muscle: "Quads", exercise: "Hack Squat Machine", setsReps: "3 x 8–12", type: "Machine compound" },
    { muscle: "Hamstrings", exercise: "Nordic Curl or Assisted Nordic Curl", setsReps: "3 x 6–10", type: "Heavy compound" },
    { muscle: "Glutes", exercise: "Cable Glute Kickback", setsReps: "3 x 12–15 each side", type: "Isolation" },
    { muscle: "Calves", exercise: "Donkey Calf Raise or Leg Press Calf Raise", setsReps: "3 x 12–20", type: "Machine compound" },
    { muscle: "Hip Abductors", exercise: "Seated Hip Abduction Machine", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Hip Adductors", exercise: "Seated Hip Adduction Machine", setsReps: "3 x 12–20", type: "Isolation" },
    { muscle: "Core", exercise: "Decline Sit-Up", setsReps: "3 x 10–15", type: "Core" }
  ]
};

export const DEFAULT_PLAN = {
  planName: "12-Week Upper/Lower Mesocycle",
  weeks: 12,
  calendar: CALENDAR,
  sessions: SESSIONS
};

export const PLAN_TEMPLATE = {
  planName: "Push Pull Legs Example",
  weeks: 12,
  calendar: [
    ["Push", "Pull", "Legs", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Push", "Pull", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Rest", "Push", "Pull", "Legs", "Rest", "Push"],
    ["Pull", "Legs", "Rest", "Push", "Pull", "Legs", "Rest"],
    ["Push", "Pull", "Legs", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Push", "Pull", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Rest", "Push", "Pull", "Legs", "Rest", "Push"],
    ["Pull", "Legs", "Rest", "Push", "Pull", "Legs", "Rest"],
    ["Push", "Pull", "Legs", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Push", "Pull", "Rest", "Push", "Pull", "Rest"],
    ["Legs", "Rest", "Push", "Pull", "Legs", "Rest", "Push"],
    ["Pull", "Legs", "Rest", "Push", "Pull", "Legs", "Rest"]
  ],
  sessions: {
    "Push": [
      { muscle: "Chest", exercise: "Barbell Bench Press", setsReps: "3 x 5–8", type: "Heavy compound" },
      { muscle: "Shoulders", exercise: "Machine Lateral Raise", setsReps: "3 x 12–20", type: "Isolation" },
      { muscle: "Triceps", exercise: "Cable Triceps Pushdown", setsReps: "3 x 10–15", type: "Isolation" }
    ],
    "Pull": [
      { muscle: "Back", exercise: "Lat Pulldown", setsReps: "3 x 8–12", type: "Machine compound" },
      { muscle: "Mid Back", exercise: "Seated Cable Row", setsReps: "3 x 8–12", type: "Machine compound" },
      { muscle: "Biceps", exercise: "Cable Curl", setsReps: "3 x 10–15", type: "Isolation" }
    ],
    "Legs": [
      { muscle: "Quads", exercise: "Hack Squat Machine", setsReps: "3 x 8–12", type: "Machine compound" },
      { muscle: "Hamstrings", exercise: "Lying Leg Curl", setsReps: "3 x 10–15", type: "Isolation" },
      { muscle: "Calves", exercise: "Seated Calf Raise", setsReps: "3 x 12–20", type: "Isolation" }
    ]
  }
};

export function buildCalendarFromRotation(rotation, weeks = 12) {
  const days = Array.from({ length: weeks * 7 }, (_, index) => rotation[index % rotation.length]);
  return Array.from({ length: weeks }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7));
}

function makeEx(muscle, exercise, setsReps, type = "Isolation") {
  return { muscle, exercise, setsReps, type };
}

export const MANSOUR_METHOD_PLAN = {
  planName: "Mansour Method",
  weeks: 12,
  calendar: buildCalendarFromRotation([
    "Legs Strength", "Rest", "Chest Strength", "Rest", "Back/Biceps Strength", "Rest", "Shoulders/Triceps Strength", "Rest",
    "Legs Hypertrophy", "Rest", "Chest Hypertrophy", "Rest", "Back/Biceps Hypertrophy", "Rest", "Shoulders/Triceps Hypertrophy", "Rest"
  ], 12),
  sessions: {
    "Legs Strength": [
      makeEx("Hip Adductors", "Adductors", "3 x 12–20"), makeEx("Hip Abductors", "Abductors", "3 x 12–20"), makeEx("Quads", "Barbell Squats (Working Sets)", "3 x 1–6", "Heavy compound"), makeEx("Quads", "Pause Squats", "3 x 3–5", "Heavy compound"), makeEx("Hamstrings", "Romanian Deadlifts", "3 x 6–8", "Heavy compound"), makeEx("Quads", "Bulgarian Split Squats", "3 x 6–8 each leg", "Heavy compound"), makeEx("Quads", "Quad Extensions", "4 x 8–10"), makeEx("Calves", "Calf Raises", "4 x 10 full + 10 top half + 10s hold")
    ],
    "Chest Strength": [
      makeEx("Chest", "Bench Press (Working Sets)", "3 x 1–6", "Heavy compound"), makeEx("Chest", "Barbell Incline Press (Wide Grip)", "6 sets pyramid", "Heavy compound"), makeEx("Chest", "DB Flat Press", "3 x 6–8", "Heavy compound"), makeEx("Chest", "Incline DB Flies", "3 x 6–8"), makeEx("Chest", "Cable Flies", "3 x 6–8"), makeEx("Chest", "Weighted Dips", "3 x 1+", "Heavy compound")
    ],
    "Back/Biceps Strength": [
      makeEx("Lats", "Standard Grip Pull-Ups", "3 x 12 max", "Heavy compound"), makeEx("Lats", "Lateral Grip Pull-Ups", "3 x 12 max", "Heavy compound"), makeEx("Lats", "Underhand Pull-Ups", "3 x 12 max", "Heavy compound"), makeEx("Lower Back", "Deadlift / Rack Pulls", "3 x 1–6", "Heavy compound"), makeEx("Mid Back", "Wide-Grip Bent Over Barbell Rows", "3 x 3–6", "Heavy compound"), makeEx("Mid Back", "Single-Arm DB Rows", "3 x 6–8 each", "Heavy compound"), makeEx("Biceps", "Hammer Curls", "3 x 6–8"), makeEx("Biceps", "Standing E-Z Bar Curls", "3 x 6–8"), makeEx("Biceps", "Cable Rope Curls", "3 x 6–8")
    ],
    "Shoulders/Triceps Strength": [
      makeEx("Shoulders", "Military Press (Working Sets)", "3 x 1–6", "Heavy compound"), makeEx("Shoulders", "Behind the Neck Barbell Press", "3 x 1–6", "Heavy compound"), makeEx("Shoulders", "Bradford Press", "3 x 6–8", "Heavy compound"), makeEx("Upper Back", "Barbell Shrugs", "3 x 8–12", "Heavy compound"), makeEx("Shoulders", "Lateral DB Raise", "3 x 6–10"), makeEx("Upper Back", "Bent Over DB Rear Delt Flies", "3 x 6–10"), makeEx("Triceps", "Close Grip Bench Press", "3 x 4–8", "Heavy compound"), makeEx("Triceps", "DB Flat Bench Skullcrushers", "3 x 6–8"), makeEx("Triceps", "Cable Tricep Pushdown", "3 x 6–8")
    ],
    "Legs Hypertrophy": [
      makeEx("Quads", "Leg Press", "3 x 12–20", "Machine compound"), makeEx("Hamstrings", "Hamstring Curl", "3 x 12–20"), makeEx("Glutes", "Hip Thrust", "3 x 12–20", "Machine compound"), makeEx("Quads", "Leg Extension", "3 x 12–20"), makeEx("Calves", "Calf Raises", "4 x 12–20")
    ],
    "Chest Hypertrophy": [
      makeEx("Chest", "A1: Chest Press", "3 x 12–15", "Machine compound"), makeEx("Chest", "A2: DB Flies", "3 x 12–15"), makeEx("Chest", "A3: End of Bench Push-Up", "3 x 12 max", "Heavy compound"), makeEx("Chest", "B1: Wide Incline Barbell Bench", "3 x 12–15", "Heavy compound"), makeEx("Chest", "B2: Incline DB Low to High Chest Fly", "3 x 12–15"), makeEx("Chest", "Upper Chest Pec Deck", "3 x 10–12"), makeEx("Chest", "Incline DB Chest Press", "4 x 12 max", "Heavy compound"), makeEx("Chest", "Bodyweight Dips", "3 x 12 max", "Heavy compound")
    ],
    "Back/Biceps Hypertrophy": [
      makeEx("Lats", "Lat Pulldown", "3 x 12–20", "Machine compound"), makeEx("Mid Back", "Machine Row", "3 x 12–20", "Machine compound"), makeEx("Lats", "Cable Pullover", "3 x 12–20"), makeEx("Biceps", "Cable Curls", "3 x 12–20"), makeEx("Biceps", "DB Hammer Curls", "3 x 12–20"), makeEx("Upper Back", "Rear Delt Machine Fly", "3 x 12–20")
    ],
    "Shoulders/Triceps Hypertrophy": [
      makeEx("Shoulders", "DB Overhead Press", "3 x 12–20", "Heavy compound"), makeEx("Shoulders", "Lateral Raise", "3 x 12–20"), makeEx("Upper Back", "Rear Delt Machine Fly", "3 x 12–20"), makeEx("Triceps", "Cable Overhead Extension", "3 x 12–20"), makeEx("Triceps", "Triceps Pressdown", "3 x 12–20"), makeEx("Core", "Cable Crunch", "3 x 12–20", "Core")
    ]
  }
};

export const PURE_BODYBUILDING_PPL_PLAN = {
  planName: "Pure Bodybuilding PPL/Arms",
  weeks: 12,
  calendar: buildCalendarFromRotation(["Pull #1", "Push #1", "Legs #1", "Arms & Weak Points", "Rest", "Pull #2", "Push #2", "Legs #2", "Rest", "Rest"], 12),
  sessions: {
    "Pull #1": [makeEx("Lats", "Neutral-Grip Pullup", "3 x 10–12", "Heavy compound"), makeEx("Hamstrings", "Nordic Ham Curl", "2 x 8", "Heavy compound"), makeEx("Mid Back", "Helms Row", "3 x 8–10", "Machine compound"), makeEx("Lats", "DB Lat Pullover", "3 x 12–15"), makeEx("Biceps", "Hammer Curl", "3 x 10–12"), makeEx("Upper Back", "Bent-Over Reverse DB Flye", "3 x 10–12")],
    "Push #1": [makeEx("Shoulders", "DB Lateral Raise", "3 x 10–12"), makeEx("Chest", "Low Incline DB Press", "4 x 8–10", "Heavy compound"), makeEx("Chest", "DB Flye (Integrated Partials)", "3 x 12–15"), makeEx("Triceps", "DB Skull Crusher", "3 x 8"), makeEx("Triceps", "Close-Grip Assisted Dip", "2 x 8–10", "Heavy compound"), makeEx("Core", "Plate-Weighted Crunch", "3 x 10–12", "Core")],
    "Legs #1": [makeEx("Hamstrings", "Nordic Ham Curl", "3 x 8–10", "Heavy compound"), makeEx("Hip Adductors", "Copenhagen Hip Adduction", "3 x 10–12"), makeEx("Quads", "Front Squat", "3 x 4, 6, 8", "Heavy compound"), makeEx("Quads", "Reverse Nordic", "3 x 10–12"), makeEx("Calves", "Seated Calf Raise", "3 x 12–15")],
    "Arms & Weak Points": [makeEx("Other", "Weak Point Exercise 1", "3 x 8–12"), makeEx("Other", "Weak Point Exercise 2 (Optional)", "2 x 8–12"), makeEx("Biceps", "DB Scott Curl", "3 x 10–12"), makeEx("Triceps", "DB Skull Crusher", "3 x 10"), makeEx("Biceps", "Spider Curl", "2 x 12–15"), makeEx("Triceps", "DB Triceps Kickback", "2 x 12–15"), makeEx("Core", "Reverse Crunch", "3 x 10–20", "Core")],
    "Pull #2": [makeEx("Mid Back", "Arm-Out Single-Arm DB Row", "3 x 10–12", "Heavy compound"), makeEx("Lower Back", "Good Morning (Light Weight)", "2 x 10–20", "Heavy compound"), makeEx("Lats", "Medium-Grip Pull Up", "3 x 10–12", "Heavy compound"), makeEx("Biceps", "Hammer Curl", "3 x 10–12"), makeEx("Upper Back", "Bent-Over Reverse DB Flye", "3 x 5,4,3+"), makeEx("Upper Back", "DB Shrug", "3 x 10–12", "Heavy compound")],
    "Push #2": [makeEx("Shoulders", "Seated DB Shoulder Press", "3 x 10–12", "Heavy compound"), makeEx("Shoulders", "DB Lateral Raise", "3 x 10–12"), makeEx("Chest", "Decline Barbell Press", "3 x 8–10", "Heavy compound"), makeEx("Chest", "Pec Deck", "2 x 15–20"), makeEx("Triceps", "DB French Press", "3 x 10–12"), makeEx("Core", "LLPT Plank", "3 x 10–20", "Core")],
    "Legs #2": [makeEx("Hamstrings", "Nordic Ham Curl", "3 x 8–10", "Heavy compound"), makeEx("Quads", "High-Bar Back Squat", "3 x 8", "Heavy compound"), makeEx("Hamstrings", "Glute-Ham Raise", "2 x 8", "Heavy compound"), makeEx("Hip Adductors", "Copenhagen Hip Adduction", "2 x 10–12"), makeEx("Quads", "Goblet Squat", "2 x 10–12", "Machine compound"), makeEx("Calves", "Donkey Calf Raise", "3 x 10–12")]
  }
};

export const PURE_BODYBUILDING_UPPER_LOWER_PLAN = {
  planName: "Pure Bodybuilding Upper/Lower",
  weeks: 12,
  calendar: buildCalendarFromRotation(["Upper #1", "Lower #1", "Rest", "Upper #2", "Lower #2", "Rest", "Arms & Weak Points", "Rest"], 12),
  sessions: {
    "Upper #1": PURE_BODYBUILDING_PPL_PLAN.sessions["Push #1"].concat(PURE_BODYBUILDING_PPL_PLAN.sessions["Pull #1"].slice(0, 4)),
    "Lower #1": PURE_BODYBUILDING_PPL_PLAN.sessions["Legs #1"],
    "Upper #2": PURE_BODYBUILDING_PPL_PLAN.sessions["Pull #2"].concat(PURE_BODYBUILDING_PPL_PLAN.sessions["Push #2"].slice(0, 4)),
    "Lower #2": PURE_BODYBUILDING_PPL_PLAN.sessions["Legs #2"],
    "Arms & Weak Points": PURE_BODYBUILDING_PPL_PLAN.sessions["Arms & Weak Points"]
  }
};

export const PDF_DEFAULT_PLANS = {
  mansour: MANSOUR_METHOD_PLAN,
  purePpl: PURE_BODYBUILDING_PPL_PLAN,
  pureUpperLower: PURE_BODYBUILDING_UPPER_LOWER_PLAN
};
