@echo off
title Workout Mesocycle Tracker
cd /d "%~dp0"

echo Starting Workout Mesocycle Tracker...
echo.
echo Current folder:
cd
echo.

if not exist package.json (
  echo ERROR: This file must be inside your rs3-comp-tracker folder.
  echo I cannot find package.json here.
  echo.
  pause
  exit /b
)

npm run dev

echo.
echo The tracker stopped or failed to start.
pause