"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

function hslToHex(hsl: string): string {
  // Parse HSL string like "hsl(222.2 84% 4.9%)" or "hsl(0 0% 14.5%)"
  const match = hsl.match(/hsl\(([^)]+)\)/);
  if (!match) return "#000000";
  
  const parts = match[1].split(/[\s,]+/).filter(Boolean);
  if (parts.length < 3) return "#000000";
  
  const [h, s, l] = parts.map((val, index) => {
    const num = parseFloat(val.replace('%', ''));
    return index === 0 ? num : num / 100;
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;

  const l = sum / 2;
  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [hexValue, setHexValue] = React.useState(() => {
    try {
      return hslToHex(value);
    } catch (error) {
      console.error('Error converting HSL to Hex:', value, error);
      return "#000000";
    }
  });

  React.useEffect(() => {
    try {
      setHexValue(hslToHex(value));
    } catch (error) {
      console.error('Error converting HSL to Hex in effect:', value, error);
      setHexValue("#000000");
    }
  }, [value]);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = event.target.value;
    setHexValue(newHex);
    onChange(hexToHsl(newHex));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  // Debug logging
  React.useEffect(() => {
    console.log('ColorPicker rendered:', { label, value, hexValue });
  }, [label, value, hexValue]);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex gap-2 items-center">
        <div className="relative w-10 h-8">
          <input
            type="color"
            value={hexValue}
            onChange={handleColorChange}
            className="absolute inset-0 w-full h-full rounded border border-input cursor-pointer"
            style={{ backgroundColor: hexValue }}
          />
        </div>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder="hsl(0 0% 0%)"
          className="flex-1 text-sm font-mono"
        />
      </div>
      {/* Debug info */}
      <div className="text-xs text-muted-foreground">
        HSL: {value} | Hex: {hexValue}
      </div>
    </div>
  );
} 