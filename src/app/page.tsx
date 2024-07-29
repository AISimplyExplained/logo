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
import { Camera, Plus, X, Download } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";

const DiamondLogoCreator: React.FC = () => {
  const [colors, setColors] = useState<string[]>([
    "#FF0000",
    "#00FF00",
    "#0000FF",
  ]);
  const [prompt, setPrompt] = useState<string>("");
  const [angle, setAngle] = useState<number>(45);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const generateColorsFromPrompt = async () => {
    setIsLoading(true);
    try {
      const res = (await axios.post("/api/color", { prompt })).data;
      setColors(res.colors);
    } catch (error) {
      toast.error("Please try Again");
    }
    setIsLoading(false);
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Diamond Logo Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full max-w-sm"
            >
              <Camera className="mr-3 h-4 w-4" /> Upload Image
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={generateColorsFromPrompt} disabled={isLoading}>
              Generate
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {colors.map((color, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeColor(index)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addColor}
              className="h-24 flex flex-col items-center justify-center"
            >
              <Plus className="h-6 w-6" />
              <span>Add Color</span>
            </Button>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Gradient Angle: {angle}°
            </label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[angle]}
              onValueChange={(value) => setAngle(value[0])}
              className="w-full"
            />
          </div>
          <div className="flex justify-center">
            <svg
              ref={svgRef}
              width="200"
              height="200"
              viewBox="0 0 100 100"
              className="w-full max-w-xs"
            >
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
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" /> Export SVG
              </Button>
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

export default DiamondLogoCreator;
