"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { WheelPickerOption } from "@/components/WheelBase";
import { WheelPicker, WheelPickerWrapper } from "@/components/WheelBase";

const createArray = (length: number, add = 0): WheelPickerOption[] =>
  Array.from({ length }, (_, i) => {
    const value = i + add;
    return {
      label: value.toString().padStart(2, "0"),
      value: value.toString(),
    };
  });

type FocusedPicker =
  | "hours"
  | "minutes"
  | "day"
  | "month"
  | "year"
  | "number"
  | null;

export function WheelPickerDemo() {
  const [focusedPicker, setFocusedPicker] = useState<FocusedPicker>(null);
  const [hourValue, setHourValue] = useState("0");
  const [minuteValue, setMinuteValue] = useState("0");
  const [inputBuffer, setInputBuffer] = useState("");
  const componentRef = useRef<HTMLDivElement>(null);

  // Date picker states
  const [dayValue, setDayValue] = useState("1");
  const [monthValue, setMonthValue] = useState("1");
  const [yearValue, setYearValue] = useState("2024");

  // Number picker state
  const [numberValue, setNumberValue] = useState("0");

  // Memoized options for performance
  const hourOptions_military = useMemo(() => createArray(24, 0), []);
  const minuteOptions = useMemo(() => createArray(60), []);
  const dayOptions = useMemo(() => createArray(31, 1), []);
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        label: new Date(2024, i, 1).toLocaleDateString("en", { month: "long" }),
        value: (i + 1).toString(),
      })),
    []
  );
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => {
        const year = 2000 + i;
        return { label: year.toString(), value: year.toString() };
      }),
    []
  );
  const numberOptions = useMemo(() => createArray(100, 0), []);

  // Formatted time display
  const formattedTime = useMemo(
    () => `${hourValue.padStart(2, "0")}:${minuteValue.padStart(2, "0")}`,
    [hourValue, minuteValue]
  );

  // Formatted date display
  const formattedDate = useMemo(() => {
    const monthName =
      monthOptions.find((m) => m.value === monthValue)?.label || "January";
    return `${dayValue.padStart(2, "0")} ${monthName} ${yearValue}`;
  }, [dayValue, monthValue, yearValue, monthOptions]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Focus controls for time picker
      if (key === "h") {
        setFocusedPicker("hours");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      if (key === "m") {
        setFocusedPicker("minutes");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      // Focus controls for date picker
      if (key === "d") {
        setFocusedPicker("day");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      if (key === "o") {
        // 'o' for month
        setFocusedPicker("month");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      if (key === "y") {
        setFocusedPicker("year");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      // Focus control for number picker
      if (key === "n") {
        setFocusedPicker("number");
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      // Escape to clear focus
      if (key === "escape") {
        setFocusedPicker(null);
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      // Clear everything with C
      if (key === "c") {
        setHourValue("0");
        setMinuteValue("0");
        setDayValue("1");
        setMonthValue("1");
        setYearValue("2024");
        setNumberValue("0");
        setFocusedPicker(null);
        setInputBuffer("");
        event.preventDefault();
        return;
      }

      // Number input
      if (/[0-9]/.test(key) && focusedPicker) {
        event.preventDefault();
        const maxLen = 2;
        const newBuffer = (inputBuffer + key).slice(-maxLen);
        setInputBuffer(newBuffer);
        if (focusedPicker === "hours") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 0 && numValue <= 23) {
            setHourValue(numValue.toString());
            if (newBuffer.length === maxLen || numValue > 2) {
              setInputBuffer("");
            }
          }
        } else if (focusedPicker === "minutes") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 0 && numValue <= 59) {
            setMinuteValue(numValue.toString());
            if (newBuffer.length === maxLen || numValue > 5) {
              setInputBuffer("");
            }
          }
        } else if (focusedPicker === "day") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 1 && numValue <= 31) {
            setDayValue(numValue.toString());
            // Clear buffer after successful selection
            setInputBuffer("");
          }
        } else if (focusedPicker === "month") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 1 && numValue <= 12) {
            setMonthValue(numValue.toString());
            // Clear buffer after successful month selection to allow immediate new input
            setInputBuffer("");
          }
        } else if (focusedPicker === "year") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 2000 && numValue <= 2049) {
            setYearValue(numValue.toString());
            // Clear buffer after successful selection
            setInputBuffer("");
          }
        } else if (focusedPicker === "number") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 0 && numValue <= 99) {
            setNumberValue(numValue.toString());
            // Clear buffer after successful selection
            setInputBuffer("");
          }
        }
      }

      // Enter to cycle through pickers
      if (key === "enter") {
        const pickerCycle = [
          "hours",
          "minutes",
          "day",
          "month",
          "year",
          "number",
        ];
        const currentIndex = pickerCycle.indexOf(focusedPicker as string);
        const nextIndex = (currentIndex + 1) % pickerCycle.length;
        setFocusedPicker(pickerCycle[nextIndex] as FocusedPicker);
        setInputBuffer("");
        event.preventDefault();
      }
    },
    [focusedPicker, inputBuffer]
  );

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => {
      // Only handle if component is focused or no other input is focused
      if (
        componentRef.current &&
        (componentRef.current.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        handleKeyDown(event);
      }
    };

    document.addEventListener("keydown", handleKeyDownEvent);
    return () => document.removeEventListener("keydown", handleKeyDownEvent);
  }, [handleKeyDown]);

  // Auto-focus the component
  useEffect(() => {
    if (componentRef.current) {
      componentRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <div className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
            <div className="flex justify-center">
              <div
                ref={componentRef}
                className="w-72 focus:outline-none group"
                tabIndex={0}
                role="application"
                aria-label="Time picker with keyboard navigation"
              >
                {/* Current Time Display */}
                <div className="mb-8 text-center">
                  <div className="text-4xl font-bold text-foreground mb-4 tracking-wider font-mono transition-all duration-300 transform hover:scale-105">
                    {formattedTime}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setFocusedPicker("hours")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        focusedPicker === "hours"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                          : "text-muted-foreground border border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      Hours (H)
                    </button>
                    <button
                      onClick={() => setFocusedPicker("minutes")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        focusedPicker === "minutes"
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                          : "text-muted-foreground border border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      Minutes (M)
                    </button>
                  </div>
                </div>

                {/* Wheel Picker */}
                <div className="transform transition-all duration-500 hover:scale-[1.02]">
                  <WheelPickerWrapper>
                    <WheelPicker
                      options={hourOptions_military}
                      infinite
                      value={hourValue}
                      onValueChange={setHourValue}
                      classNames={{
                        highlightWrapper:
                          focusedPicker === "hours"
                            ? "bg-gradient-to-br from-primary/20 to-primary/30 text-primary border-2 border-primary shadow-xl shadow-primary/25 transform scale-105 transition-all duration-300"
                            : "border border-border text-foreground hover:border-primary/50 transition-all duration-200",
                      }}
                    />
                    <WheelPicker
                      options={minuteOptions}
                      infinite
                      value={minuteValue}
                      onValueChange={setMinuteValue}
                      classNames={{
                        highlightWrapper:
                          focusedPicker === "minutes"
                            ? "bg-gradient-to-br from-primary/20 to-primary/30 text-primary border-2 border-primary shadow-xl shadow-primary/25 transform scale-105 transition-all duration-300"
                            : "border border-border text-foreground hover:border-primary/50 transition-all duration-200",
                      }}
                    />
                  </WheelPickerWrapper>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Picker Variations */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Picker Variations</h2>
            <p className="text-muted-foreground">
              Different types of wheel pickers with keyboard shortcuts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Date Picker */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                  Date Picker
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select day, month, and year
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Press D, O, Y for day/month/year
                </p>
                <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                  Type 1=Jan, 2=Feb, 3=Mar, etc.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 dark:from-blue-950/20 dark:to-blue-900/10 p-6 rounded-2xl border border-blue-200/30 dark:border-blue-800/20">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    {formattedDate}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 opacity-75">
                    Month {monthValue} ={" "}
                    {monthOptions.find((m) => m.value === monthValue)?.label}
                  </div>
                </div>
                <WheelPickerWrapper>
                  <WheelPicker
                    options={dayOptions}
                    infinite
                    value={dayValue}
                    onValueChange={setDayValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "day"
                          ? "bg-gradient-to-br from-blue-200/50 to-blue-300/30 dark:from-blue-800/50 dark:to-blue-700/30 border-2 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 shadow-lg shadow-blue-500/25 transform scale-105 transition-all duration-300"
                          : "border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200",
                    }}
                  />
                  <WheelPicker
                    options={monthOptions}
                    infinite
                    value={monthValue}
                    onValueChange={setMonthValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "month"
                          ? "bg-gradient-to-br from-blue-200/50 to-blue-300/30 dark:from-blue-800/50 dark:to-blue-700/30 border-2 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 shadow-lg shadow-blue-500/25 transform scale-105 transition-all duration-300"
                          : "border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200",
                    }}
                  />
                  <WheelPicker
                    options={yearOptions}
                    infinite
                    value={yearValue}
                    onValueChange={setYearValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "year"
                          ? "bg-gradient-to-br from-blue-200/50 to-blue-300/30 dark:from-blue-800/50 dark:to-blue-700/30 border-2 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 shadow-lg shadow-blue-500/25 transform scale-105 transition-all duration-300"
                          : "border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200",
                    }}
                  />
                </WheelPickerWrapper>
              </div>
            </div>

            {/* Number Picker */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300">
                  Number Picker
                </h3>
                <p className="text-sm text-muted-foreground">
                  Simple number selection
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Press N for number selection
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50/30 to-emerald-100/20 dark:from-green-950/20 dark:to-emerald-900/10 p-6 rounded-2xl border border-green-200/30 dark:border-green-800/20">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                    Selected: {numberValue}
                  </div>
                </div>
                <WheelPickerWrapper>
                  <WheelPicker
                    options={numberOptions}
                    infinite
                    value={numberValue}
                    onValueChange={setNumberValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "number"
                          ? "bg-gradient-to-br from-green-200/50 to-emerald-300/30 dark:from-green-800/50 dark:to-emerald-700/30 border-2 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 shadow-lg shadow-green-500/25 transform scale-105 transition-all duration-300"
                          : "border border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200",
                    }}
                  />
                </WheelPickerWrapper>
              </div>
            </div>

            {/* Custom Styled */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                  Custom Styled
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enhanced visual design
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Uses same hour picker (H)
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50/30 to-violet-100/20 dark:from-purple-950/20 dark:to-violet-900/10 p-6 rounded-2xl border border-purple-200/30 dark:border-purple-800/20">
                <div className="text-center mb-4">
                  <div className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Hour: {hourValue.padStart(2, "0")}
                  </div>
                </div>
                <WheelPickerWrapper>
                  <WheelPicker
                    options={hourOptions_military}
                    infinite
                    value={hourValue}
                    onValueChange={setHourValue}
                    classNames={{
                      highlightWrapper:
                        "bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 border-2 border-purple-400 dark:border-purple-600 text-purple-800 dark:text-purple-200 shadow-lg shadow-purple-500/25 transition-all duration-300",
                    }}
                  />
                </WheelPickerWrapper>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Controls */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">
              Comprehensive Keyboard Navigation
            </h2>
            <p className="text-muted-foreground">
              Enhanced accessibility with shortcuts for all picker types
            </p>
          </div>

          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-8 rounded-3xl border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  H
                </kbd>
                <span className="text-muted-foreground">Select hours</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  M
                </kbd>
                <span className="text-muted-foreground">Select minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  D
                </kbd>
                <span className="text-muted-foreground">Select day</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  O
                </kbd>
                <span className="text-muted-foreground">Select month</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  Y
                </kbd>
                <span className="text-muted-foreground">Select year</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  N
                </kbd>
                <span className="text-muted-foreground">Select number</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  ↵
                </kbd>
                <span className="text-muted-foreground">Cycle pickers</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  Esc
                </kbd>
                <span className="text-muted-foreground">Clear selection</span>
              </div>
              <div className="flex items-center gap-3">
                <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                  C
                </kbd>
                <span className="text-muted-foreground">Clear all values</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WheelPickerTheme() {
  const [focusedPicker, setFocusedPicker] = useState<"hours" | "minutes" | null>(null);
  const [hourValue, setHourValue] = useState("0");
  const [minuteValue, setMinuteValue] = useState("0");
  const [inputBuffer, setInputBuffer] = useState("");
  const componentRef = useRef<HTMLDivElement>(null);

  const hourOptions_military = useMemo(() => createArray(24, 0), []);
  const minuteOptions = useMemo(() => createArray(60), []);

  const formattedTime = useMemo(
    () => `${hourValue.padStart(2, "0")}:${minuteValue.padStart(2, "0")}`,
    [hourValue, minuteValue]
  );

  // Keyboard navigation for hours and minutes only
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === "h") {
        setFocusedPicker("hours");
        setInputBuffer("");
        event.preventDefault();
        return;
      }
      if (key === "m") {
        setFocusedPicker("minutes");
        setInputBuffer("");
        event.preventDefault();
        return;
      }
      if (key === "escape") {
        setFocusedPicker(null);
        setInputBuffer("");
        event.preventDefault();
        return;
      }
      if (key === "c") {
        setHourValue("0");
        setMinuteValue("0");
        setFocusedPicker(null);
        setInputBuffer("");
        event.preventDefault();
        return;
      }
      if (/[0-9]/.test(key) && focusedPicker) {
        event.preventDefault();
        const maxLen = 2;
        const newBuffer = (inputBuffer + key).slice(-maxLen);
        setInputBuffer(newBuffer);
        if (focusedPicker === "hours") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 0 && numValue <= 23) {
            setHourValue(numValue.toString());
            if (newBuffer.length === maxLen || numValue > 2) {
              setInputBuffer("");
            }
          }
        } else if (focusedPicker === "minutes") {
          const numValue = parseInt(newBuffer);
          if (numValue >= 0 && numValue <= 59) {
            setMinuteValue(numValue.toString());
            if (newBuffer.length === maxLen || numValue > 5) {
              setInputBuffer("");
            }
          }
        }
      }
      if (key === "enter") {
        setFocusedPicker((prev) => (prev === "hours" ? "minutes" : "hours"));
        setInputBuffer("");
        event.preventDefault();
      }
    },
    [focusedPicker, inputBuffer]
  );

  useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => {
      if (
        componentRef.current &&
        (componentRef.current.contains(document.activeElement) ||
          document.activeElement === document.body)
      ) {
        handleKeyDown(event);
      }
    };
    document.addEventListener("keydown", handleKeyDownEvent);
    return () => document.removeEventListener("keydown", handleKeyDownEvent);
  }, [handleKeyDown]);

  useEffect(() => {
    if (componentRef.current) {
      componentRef.current.focus();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-background via-muted/20 to-background rounded-3xl border border-border/50 shadow-2xl">
      <div className="text-center space-y-6">
        <div className="relative p-8 rounded-3xl bg-card/30 backdrop-blur-sm border border-border/50 shadow-2xl">
          <div className="flex justify-center">
            <div
              ref={componentRef}
              className="w-72 focus:outline-none group"
              tabIndex={0}
              role="application"
              aria-label="Time picker with keyboard navigation"
            >
              {/* Current Time Display */}
              <div className="mb-8 text-center">
                <div className="text-4xl font-bold text-foreground mb-4 tracking-wider font-mono transition-all duration-300 transform hover:scale-105">
                  {formattedTime}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setFocusedPicker("hours")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      focusedPicker === "hours"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "text-muted-foreground border border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    Hours (H)
                  </button>
                  <button
                    onClick={() => setFocusedPicker("minutes")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      focusedPicker === "minutes"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : "text-muted-foreground border border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    Minutes (M)
                  </button>
                </div>
              </div>
              {/* Wheel Picker */}
              <div className="transform transition-all duration-500 hover:scale-[1.02]">
                <WheelPickerWrapper>
                  <WheelPicker
                    options={hourOptions_military}
                    infinite
                    value={hourValue}
                    onValueChange={setHourValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "hours"
                          ? "bg-gradient-to-br from-primary/20 to-primary/30 text-primary border-2 border-primary shadow-xl shadow-primary/25 transform scale-105 transition-all duration-300"
                          : "border border-border text-foreground hover:border-primary/50 transition-all duration-200",
                    }}
                  />
                  <WheelPicker
                    options={minuteOptions}
                    infinite
                    value={minuteValue}
                    onValueChange={setMinuteValue}
                    classNames={{
                      highlightWrapper:
                        focusedPicker === "minutes"
                          ? "bg-gradient-to-br from-primary/20 to-primary/30 text-primary border-2 border-primary shadow-xl shadow-primary/25 transform scale-105 transition-all duration-300"
                          : "border border-border text-foreground hover:border-primary/50 transition-all duration-200",
                    }}
                  />
                </WheelPickerWrapper>
              </div>
            </div>
          </div>
        </div>
        {/* Keyboard Controls */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                H
              </kbd>
              <span className="text-muted-foreground">Select hours</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                M
              </kbd>
              <span className="text-muted-foreground">Select minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                0-9
              </kbd>
              <span className="text-muted-foreground">Type numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                ↵
              </kbd>
              <span className="text-muted-foreground">Cycle pickers</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                Esc
              </kbd>
              <span className="text-muted-foreground">Clear selection</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-2 text-sm font-mono bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-100 rounded-lg shadow-sm border border-zinc-600 min-w-[40px] text-center">
                C
              </kbd>
              <span className="text-muted-foreground">Clear all values</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}