"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Check, ChevronDown } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const predefinedColors = [
  "#000000", // Black
  "#ffffff", // White
  "#4f46e5", // Indigo
  "#10b981", // Emerald
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#6b7280", // Gray
]

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-10 h-10 rounded-md border border-input cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => setIsOpen(true)}
      />
      <Input type="text" value={color} onChange={(e) => onChange(e.target.value)} className="w-28" />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="grid grid-cols-5 gap-2">
            {predefinedColors.map((c) => (
              <button
                key={c}
                className="w-10 h-10 rounded-md border border-input flex items-center justify-center"
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c)
                  setIsOpen(false)
                }}
              >
                {color === c && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-full h-10" />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ColorPicker

