"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

interface CountdownProps {
  endDate: Date;
  startDate?: Date;
  className?: string;
  compactPreview?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function AnimatedNumberCountdown({
  endDate,
  startDate,
  className,
  compactPreview = false,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = startDate ? new Date(startDate) : new Date();
      const end = new Date(endDate);
      const difference = end.getTime() - start.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, startDate]);

  if (compactPreview) {
    return (
      <div className="min-h-14 flex items-center justify-center gap-1 h-full w-full p-1">
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.days}
            className="text-4xl font-bold text-foreground leading-none"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <span className="text-4xl font-bold text-muted-foreground mx-0.5">
          :
        </span>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.hours}
            className="text-4xl font-bold text-foreground leading-none"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <span className="text-3xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.minutes}
            className="text-4xl font-bold text-foreground leading-none"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <span className="text-3xl font-bold text-muted-foreground">:</span>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.seconds}
            className="text-4xl font-bold text-foreground leading-none"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${className}`}>
      {/* Mobile Layout (< 640px) */}
      <div className="sm:hidden">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-lg p-3 bg-card dark:bg-card border border-border">
            <NumberFlow
              value={timeLeft.days}
              className="text-2xl font-semibold tracking-tighter text-foreground"
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
          <div className="flex flex-col items-center rounded-lg p-3 bg-card dark:bg-card border border-border">
            <NumberFlow
              value={timeLeft.hours}
              className="text-2xl font-semibold tracking-tighter text-foreground"
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
          <div className="flex flex-col items-center rounded-lg p-3 bg-card dark:bg-card border border-border">
            <NumberFlow
              value={timeLeft.minutes}
              className="text-2xl font-semibold tracking-tighter text-foreground"
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
          <div className="flex flex-col items-center rounded-lg p-3 bg-card dark:bg-card border border-border">
            <NumberFlow
              value={timeLeft.seconds}
              className="text-2xl font-semibold tracking-tighter text-foreground"
              format={{ minimumIntegerDigits: 2 }}
            />
          </div>
        </div>
      </div>

      {/* Tablet Layout (640px - 1024px) */}
      <div className="hidden sm:flex lg:hidden items-center justify-center gap-2">
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.days}
            className="text-3xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-xl font-bold mx-1 text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.hours}
            className="text-3xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-xl font-bold mx-1 text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.minutes}
            className="text-3xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-xl font-bold mx-1 text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.seconds}
            className="text-3xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
      </div>

      {/* Desktop Layout (>= 1024px) */}
      <div className="hidden lg:flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.days}
            className="text-5xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-2xl font-bold text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.hours}
            className="text-5xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-2xl font-bold text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.minutes}
            className="text-5xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
        <div className="text-2xl font-bold text-muted-foreground">:</div>
        <div className="flex flex-col items-center">
          <NumberFlow
            value={timeLeft.seconds}
            className="text-5xl font-semibold tracking-tighter text-foreground"
            format={{ minimumIntegerDigits: 2 }}
          />
        </div>
      </div>
    </div>
  );
}

export function AnimatedNumberCountdownShowcase() {
  return (
    <div className="flex flex-col p-4 bg-background">
      <AnimatedNumberCountdown
        endDate={new Date("2025-10-09")}
        className="my-4"
        compactPreview={true}
      />
    </div>
  );
}

export function AnimatedNumberCountdownTheme() {
  return (
    <>
      <AnimatedNumberCountdown
        endDate={new Date("2025-10-09")}
        className="my-4"
        compactPreview={true}
      />
    </>
  );
}
