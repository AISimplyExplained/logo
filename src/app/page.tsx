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
import { ColorSwatch } from "@/components/ColorSwatch";

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
    if (!prompt.trim()) {
      toast.error("Please enter a prompt before generating colors.");
      return;
    }

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
    <Card className="w-full max-w-4xl mx-auto my-4">
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
          <div className="space-y-3">
            <Label htmlFor="prompt" className="">
              Prompt
            </Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="resize-none"
            />
            <Button
              onClick={generateColorsFromPrompt}
              disabled={isLoading || !prompt.trim()}
            >
              Generate
            </Button>
          </div>
          <div className="flex flex-wrap justify-start gap-6 items-center">
            {colors.map((color, index) => (
              <ColorSwatch
                key={index}
                color={color}
                index={index}
                handleColorChange={handleColorChange}
                removeColor={removeColor}
              />
            ))}
          </div>
          <Button onClick={addColor}>Add Color</Button>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="gradient-angle" className="text-sm font-medium">
                Gradient Angle
              </Label>
              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-2 rounded-full">
                {angle}°
              </span>
            </div>
            <Slider
              id="gradient-angle"
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
              <path
                d="M50 0 L100 50 L50 100 L0 50 Z"
                fill="none"
                stroke="black"
                strokeWidth="0"
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
