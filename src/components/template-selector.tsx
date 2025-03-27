"use client"

import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"
import { Label } from "@radix-ui/react-label"
import type { Template } from "../lib/types"

interface TemplateSelectorProps {
  selectedTemplate: Template
  onSelectTemplate: (template: Template) => void
}

const templates = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional certificate design with ornate borders",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean, contemporary design with minimal elements",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated design with refined typography",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, uncluttered design focusing on content",
  },
]

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <RadioGroup
      value={selectedTemplate}
      onValueChange={(value: string) => onSelectTemplate(value as Template)}
      className="space-y-4"
    >
      {templates.map((template) => (
        <div key={template.id} className="flex items-start space-x-2">
          <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor={template.id} className="font-medium">
              {template.name}
            </Label>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}

export default TemplateSelector

