'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const COLORS = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'None', value: null, class: 'bg-transparent border-2 border-gray-300' },
];

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string | null) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const selectedColor = COLORS.find(c => c.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={`h-4 w-4 rounded-full flex-shrink-0 transition-all hover:scale-110 ${
            selectedColor?.class || 'bg-transparent border-2 border-white/40'
          }`}
          aria-label="Pick color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={(e) => {
                e.stopPropagation();
                onChange(color.value);
                setOpen(false);
              }}
              className={`h-8 w-8 rounded-full transition-all hover:scale-110 ${color.class} ${
                value === color.value ? 'ring-2 ring-gray-900 ring-offset-2' : ''
              }`}
              aria-label={color.name}
              title={color.name}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
