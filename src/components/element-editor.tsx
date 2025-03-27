// src/components/element-editor.tsx
import type React from "react";
import { useState } from "react";
import { Input } from "./input";
import { Label } from "@radix-ui/react-label";
import { Slider } from "@radix-ui/react-slider";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import ColorPicker from "./color-picker";
import type { CertificateElement } from "../lib/types";

interface ElementEditorProps {
  element: CertificateElement;
  onUpdate: (updates: Partial<CertificateElement>) => void;
}

const ElementEditor = ({ element, onUpdate }: ElementEditorProps) => {
  const [, setImageUrl] = useState(element.imageUrl || "");

  // Type-safe handlers
  const handleFontFamilyChange = (value: 'default' | 'script' | 'serif' | 'sans') =>
    onUpdate({ fontFamily: value });

  const handleTextAlignChange = (value: 'left' | 'center' | 'right') =>
    onUpdate({ textAlign: value });

  const handleFontWeightChange = (value: 'normal' | 'bold' | 'light') =>
    onUpdate({ fontWeight: value });

  const handleShapeChange = (value: 'rectangle' | 'circle') =>
    onUpdate({ shape: value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setImageUrl(url);
        onUpdate({ imageUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {element.type === "text" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="content">Text Content</Label>
            <Textarea
              id="content"
              value={element.content || ""}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select
              value={element.fontFamily || "default"}
              onValueChange={handleFontFamilyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="sans">Sans-serif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textAlign">Text Alignment</Label>
            <Select
              value={element.textAlign || "center"}
              onValueChange={handleTextAlignChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontWeight">Font Weight</Label>
            <Select
              value={element.fontWeight || "normal"}
              onValueChange={handleFontWeightChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {element.type === "image" && (
        <div className="space-y-2">
          <Label htmlFor="imageUpload">Upload Image</Label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
          {element.imageUrl && (
            <div className="mt-2">
              <img
                src={element.imageUrl || "/placeholder.svg"}
                alt="Preview"
                className="max-h-32 max-w-full object-contain border border-gray-200 rounded-md"
              />
            </div>
          )}
        </div>
      )}

      {element.type === "shape" && (
        <div className="space-y-2">
          <Label htmlFor="shape">Shape Type</Label>
          <Select
            value={element.shape || "rectangle"}
            onValueChange={handleShapeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fontSize">Size</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="fontSize"
            min={8}
            max={72}
            step={1}
            value={[element.fontSize || 16]}
            onValueChange={(value) => onUpdate({ fontSize: value[0] })}
          />
          <span className="w-12 text-center">{element.fontSize || 16}px</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="width">Width (%)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="width"
            min={5}
            max={100}
            step={1}
            value={[element.width || 30]}
            onValueChange={(value) => onUpdate({ width: value[0] })}
          />
          <span className="w-12 text-center">{element.width || 30}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <ColorPicker
          color={element.color || "#000000"}
          onChange={(color) => onUpdate({ color })}
        />
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="x-position" className="text-xs">
              X Position (%)
            </Label>
            <Input
              id="x-position"
              type="number"
              min={0}
              max={100}
              value={element.x}
              onChange={(e) => onUpdate({ x: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="y-position" className="text-xs">
              Y Position (%)
            </Label>
            <Input
              id="y-position"
              type="number"
              min={0}
              max={100}
              value={element.y}
              onChange={(e) => onUpdate({ y: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementEditor;