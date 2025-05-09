'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, defaultValue, value, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
    // For range slider (two thumbs)
    const [localValues, setLocalValues] = React.useState<number[]>(
      value || defaultValue || [min, max]
    );

    React.useEffect(() => {
      if (value) {
        setLocalValues(value);
      }
    }, [value]);

    const handleChange = (newValue: number, index: number) => {
      const newValues = [...localValues];
      newValues[index] = newValue;
      setLocalValues(newValues);
      onValueChange?.(newValues);
    };

    return (
      <div ref={ref} className={cn('relative flex w-full touch-none select-none items-center', className)}>
        {/* First thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValues[0]}
          onChange={(e) => handleChange(Number(e.target.value), 0)}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              var(--secondary) 0%, 
              var(--secondary) ${((localValues[0] - min) / (max - min)) * 100}%, 
              var(--primary) ${((localValues[0] - min) / (max - min)) * 100}%, 
              var(--primary) ${((localValues[1] - min) / (max - min)) * 100}%, 
              var(--secondary) ${((localValues[1] - min) / (max - min)) * 100}%, 
              var(--secondary) 100%)`
          }}
          {...props}
        />
        
        {/* Second thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValues[1]}
          onChange={(e) => handleChange(Number(e.target.value), 1)}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer absolute"
          style={{
            background: 'transparent'
          }}
          {...props}
        />
      </div>
    );
  }
);

// Create a simplified version for single value slider
const SingleSlider = React.forwardRef<HTMLInputElement, Omit<SliderProps, 'value' | 'defaultValue' | 'onValueChange'> & {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
}>(
  ({ className, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onValueChange?.(newValue);
    };

    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value ?? defaultValue ?? min}
        onChange={handleChange}
        className={cn(
          "w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "range-thumb:h-5 range-thumb:w-5 range-thumb:rounded-full range-thumb:border-2 range-thumb:border-primary range-thumb:bg-background",
          className
        )}
        {...props}
      />
    );
  }
);

Slider.displayName = "RangeSlider";
SingleSlider.displayName = "Slider";

export { Slider, SingleSlider as SimpleSlider };
