"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
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
import { Camera, Plus, X, Download, Upload, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { toast } from "sonner";
import { ColorSwatch } from "@/components/ColorSwatch";
import MeshGradient from "mesh-gradient.js";
import ColorThief from "colorthief";

const DiamondLogoCreator: React.FC = () => {
  const [colors, setColors] = useState<string[]>(["#ee99ff", "#5effd0"]);
  const [prompt, setPrompt] = useState<string>("");
  const [angle, setAngle] = useState<number>(45);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMeshGradient, setIsMeshGradient] = useState<boolean>(false);
  const [meshId, setMeshId] = useState<number>(780);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const gradientRef = useRef<any>(null);

  useEffect(() => {
    if (isMeshGradient && canvasRef.current) {
      gradientRef.current = new MeshGradient();
      gradientRef.current.initGradient("#mesh-canvas", colors);
      gradientRef.current.changePosition(meshId);

      // Apply diamond shape mask after rendering the gradient
      applyDiamondMask();
    }
  }, [isMeshGradient, colors, meshId]);

  const applyDiamondMask = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { width, height } = canvas;

        // Create a temporary canvas to hold the original gradient
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);

          // Clear the original canvas
          ctx.clearRect(0, 0, width, height);

          // Create a diamond path
          ctx.beginPath();
          ctx.moveTo(width / 2, 0);
          ctx.lineTo(width, height / 2);
          ctx.lineTo(width / 2, height);
          ctx.lineTo(0, height / 2);
          ctx.closePath();

          // Clip to the diamond shape
          ctx.clip();

          // Draw the gradient back onto the clipped region
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    }
  };

  const handleColorChange = (index: number, color: string): void => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
    if (isMeshGradient && gradientRef.current) {
      gradientRef.current.changeGradientColors(newColors);
      setTimeout(applyDiamondMask, 0);
    }
  };

  const addColor = (): void => {
    const newColor = "#FFFFFF";
    const newColors = [...colors, newColor];
    setColors(newColors);
    if (isMeshGradient && gradientRef.current) {
      gradientRef.current.changeGradientColors(newColors);
      setTimeout(applyDiamondMask, 0);
    }
  };

  const removeColor = (index: number): void => {
    if (colors.length > 2) {
      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      if (isMeshGradient && gradientRef.current) {
        gradientRef.current.changeGradientColors(newColors);
        setTimeout(applyDiamondMask, 0);
      }
    } else {
      toast.error("Minimum two colors are required.");
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setPreviewImage(e.target?.result as string);
        const img = new Image();
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
      if (isMeshGradient && gradientRef.current) {
        gradientRef.current.changeGradientColors(res.colors);
        setTimeout(applyDiamondMask, 0);
      }
    } catch (error) {
      toast.error("Please try Again");
    }
    setIsLoading(false);
  };

  const exportImage = (): void => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = dataURL;
      downloadLink.download = "diamond_mesh_gradient.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else if (svgRef.current && ctx) {
      const svg = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = "diamond_logo.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }, "image/png");
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const regenerateMesh = () => {
    const newMeshId = Math.floor(Math.random() * 1000);
    setMeshId(newMeshId);
    if (gradientRef.current) {
      gradientRef.current.changePosition(newMeshId);
      // Re-apply the diamond mask after regenerating
      setTimeout(applyDiamondMask, 0);
    }
  };

  const removeImage = (): void => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractColor = () => {
    if (!imageRef.current || !previewImage) {
      return;
    }

    const colorThief = new ColorThief();

    try {
      const palette = colorThief.getPalette(imageRef.current, 10);
      const hexColors = palette.map(([r, g, b]) => rgbToHex(r, g, b));
      setColors(hexColors);
      if (isMeshGradient && gradientRef.current) {
        gradientRef.current.changeGradientColors(hexColors);
        setTimeout(applyDiamondMask, 0);
      }
      console.log("colors", hexColors);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  useEffect(() => {
    if (previewImage && imageRef.current) {
      if (imageRef.current.complete) {
        extractColor();
      } else {
        imageRef.current.onload = extractColor;
      }
    }
  }, [previewImage]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-4">
          <img
            src="dlogo.png"
            alt="Logo Creator"
            className="w-16 h-16 object-contain"
          />
          <CardTitle className="text-2xl font-bold">
            Diamond Logo Diffuser
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Choose Your Input Method:
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">
                Upload an Image for Inspiration
              </h3>
              <p className="text-sm">
                Upload an image that captures the essence of your desired
                colours.
              </p>
              <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      ref={imageRef}
                      src={previewImage}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={removeImage}
                      className="absolute top-2 right-2 z-10 rounded-full bg-background border border-input h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Camera className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm"
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
              <Input
                id="image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">Or Describe Your Mood</h3>
              <p className="text-sm">
                Enter a phrase or description to set the tone for your
                logo&apos;s colours, e.g., &quot;I&apos;m feeling blue&quot; or
                &quot;A warm sunset&quot;
              </p>
              <Textarea
                id="prompt"
                value={prompt}
                placeholder="I am feeling blue"
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none h-40 text-sm"
              />
              <Button
                onClick={generateColorsFromPrompt}
                disabled={isLoading || !prompt.trim()}
                className="w-full text-sm"
              >
                Generate
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <h2 className="text-lg font-semibold mb-4 mt-11">
              Dominant Colors Extraction
            </h2>
            <p className="text-sm mb-4">
              Based on your input, we&apos;ve extracted the dominant colours.
              Adjust and fine-tune them as needed.
            </p>
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
              <Button onClick={addColor} className="h-12 w-12 rounded-full p-0">
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="mesh-gradient"
                checked={isMeshGradient}
                onCheckedChange={setIsMeshGradient}
              />
              <Label htmlFor="mesh-gradient" className="text-sm">
                Use Mesh Gradient
              </Label>
            </div>
            {isMeshGradient && (
              <Button onClick={regenerateMesh} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Mesh
              </Button>
            )}
          </div>

          {!isMeshGradient && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mt-11">
                <Label htmlFor="gradient-angle" className="text-sm font-medium">
                  Gradient Angle
                </Label>
                <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
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
          )}
        </div>

        <div className="flex justify-center mb-10">
          {isMeshGradient ? (
            <div className="relative w-full max-w-md aspect-[2/1]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-full h-full"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                  }}
                >
                  <canvas
                    id="mesh-canvas"
                    ref={canvasRef}
                    width={500}
                    height={250}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <svg
              ref={svgRef}
              width="500"
              height="250"
              viewBox="0 0 300 150"
              className="w-full max-w-md"
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
                d="M150 0 L300 75 L150 150 L0 75 Z"
                fill="url(#diamondGradient)"
              />
            </svg>
          )}
        </div>

        <div className="flex gap-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex-1 text-sm">
                <Download className="mr-2 h-4 w-4" /> Export PNG
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Export PNG</AlertDialogTitle>
                <AlertDialogDescription>
                  Your diamond logo with mesh gradient (PNG) is ready to
                  download.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={exportImage}>
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

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

export default DiamondLogoCreator;
