import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ColorSwatchProps {
  color: string;
  index: number;
  handleColorChange: (index: number, color: string) => void;
  removeColor: (index: number) => void;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  index,
  handleColorChange,
  removeColor,
}) => (
  <div className="relative">
    <Button
      variant="outline"
      size="icon"
      onClick={() => removeColor(index)}
      className="absolute -top-1 -right-1 z-10 rounded-full bg-background border border-input h-6 w-6 p-0"
    >
      <X className="h-3 w-3" />
    </Button>
    <div className="rounded-full w-16 h-16 cursor-pointer overflow-hidden border border-input relative">
      <Input
        type="color"
        value={color}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleColorChange(index, e.target.value)
        }
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
      <div 
        className="w-full h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
);