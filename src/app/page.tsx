"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Page: React.FC = () => {
  const [colors, setColors] = useState<string[]>([
    "#FF0000",
    "#00FF00",
    "#0000FF",
  ]);
  const [angle, setAngle] = useState<number>(45);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleColorChange = (index: number, color: string): void => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const addColor = (): void => {
    setColors([...colors, "#FFFFFF"]);
  };

  const removeColor = (index: number): void => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const extractedColors = extractColors(imageData.data);
            setColors(extractedColors);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const extractColors = (pixels: Uint8ClampedArray): string[] => {
    const colorCounts: { [key: string]: number } = {};
    for (let i = 0; i < pixels.length; i += 4) {
      const color = `#${pixels[i].toString(16).padStart(2, "0")}${pixels[i + 1]
        .toString(16)
        .padStart(2, "0")}${pixels[i + 2].toString(16).padStart(2, "0")}`;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
    return Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  };

  const exportSVG = (): void => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "diamond_logo.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Diamond Logo Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-10 h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeColor(index)}
                >
                  X
                </Button>
              </div>
            ))}
            <Button onClick={addColor}>Add Color</Button>
          </div>
          <div>
            <label>Gradient Angle: {angle}°</label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[angle]}
              onValueChange={(value) => setAngle(value[0])}
            />
          </div>
          <svg ref={svgRef} width="200" height="200" viewBox="0 0 100 100">
            <defs>
              <linearGradient
                id="diamondGradient"
                gradientTransform={`rotate(${angle})`}
              >
                {colors.map((color, index) => (
                  <stop
                    key={index}
                    offset={`${(index / (colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            </defs>
            <path
              d="M50 0 L100 50 L50 100 L0 50 Z"
              fill="url(#diamondGradient)"
            />
          </svg>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Export SVG</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Export SVG</AlertDialogTitle>
                <AlertDialogDescription>
                  Your diamond logo SVG is ready to download.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={exportSVG}>
                  Download
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page;
