import type React from "react"

import { useState, useRef } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Card, CardContent } from "./card"
import { Slider } from "./slider"
import html2canvas from 'html2canvas';
import {
  Download, ImageIcon, Type, Palette, RefreshCw, Plus,
  TextIcon, Image, Square, Award, Trash2, Loader2, AlertCircle, Printer
} from "lucide-react";
import CertificatePreview from "./certificate-preview";
import TemplateSelector from "./template-selector";
import ColorPicker from "./color-picker";
import ElementEditor from "./element-editor";
import type { Certificate, Template, CertificateElement } from "../lib/types";

const defaultCertificate: Certificate = {
  recipientName: "John Doe",
  title: "Certificate of Achievement",
  issuerName: "Your Organization",
  issueDate: new Date().toLocaleDateString(),
  signature: "Jane Smith",
  signatureTitle: "CEO",
  backgroundColor: "#ffffff",
  textColor: "#000000",
  accentColor: "#4f46e5",
  backgroundImage: null,
  template: "classic",
  fontSize: 24,
  elements: [
    {
      id: "title",
      type: "text",
      content: "Certificate of Achievement",
      x: 50,
      y: 10,
      width: 80,
      fontSize: 36,
      fontWeight: "bold",
      color: "#000000",
      textAlign: "center",
    },
    {
      id: "recipient-label",
      type: "text",
      content: "This certificate is presented to",
      x: 50,
      y: 25,
      width: 60,
      fontSize: 18,
      fontWeight: "normal",
      color: "#666666",
      textAlign: "center",
    },
    {
      id: "recipient-name",
      type: "text",
      content: "John Doe",
      x: 50,
      y: 35,
      width: 70,
      fontSize: 42,
      fontWeight: "bold",
      color: "#4f46e5",
      textAlign: "center",
      fontFamily: "script",
    },
    {
      id: "description",
      type: "text",
      content: "For outstanding achievement and dedication",
      x: 50,
      y: 50,
      width: 70,
      fontSize: 16,
      fontWeight: "normal",
      color: "#333333",
      textAlign: "center",
    },
    {
      id: "date",
      type: "text",
      content: new Date().toLocaleDateString(),
      x: 25,
      y: 75,
      width: 30,
      fontSize: 14,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
    },
    {
      id: "signature",
      type: "text",
      content: "Jane Smith",
      x: 75,
      y: 75,
      width: 30,
      fontSize: 24,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
      fontFamily: "script",
    },
    {
      id: "signature-title",
      type: "text",
      content: "CEO, Your Organization",
      x: 75,
      y: 80,
      width: 30,
      fontSize: 14,
      fontWeight: "normal",
      color: "#666666",
      textAlign: "center",
    },
  ],
};

const CertificateGenerator = () => {
  const [certificate, setCertificate] = useState<Certificate>(defaultCertificate);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof Certificate, value: string | number | null) => {
    setCertificate((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateChange = (template: Template) => {
    setCertificate((prev) => ({
      ...prev,
      template,
    }));
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleInputChange("backgroundImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCertificate = async () => {
    if (!canvasRef.current) {
      setError("Certificate preview not available");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: certificate.backgroundColor,
        ignoreElements: (element) => {
          return element.classList?.contains('ignore-for-export');
        }
      });

      const link = document.createElement('a');
      link.download = `${certificate.recipientName.replace(/\s+/g, '-')}-certificate.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError(`Failed to generate certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const printCertificate = async () => {
    if (!canvasRef.current) {
      setError("Certificate preview not available");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        logging: true,
        useCORS: true,
        backgroundColor: certificate.backgroundColor,
        ignoreElements: (element) => {
          return element.classList?.contains('ignore-for-export');
        }
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Certificate</title>
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL()}" onload="window.print()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error preparing certificate for printing:', error);
      setError(`Failed to prepare certificate for printing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToDefault = () => {
    setCertificate(defaultCertificate);
    setSelectedElement(null);
    setError(null);
  };

  const addElement = (type: string) => {
    const newId = `element-${Date.now()}`;
    const newElement: CertificateElement = {
      id: newId,
      type: type as "text" | "image" | "shape" | "badge",
      content: type === "text" ? "New Text" : null,
      x: 50,
      y: 50,
      width: 30,
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
    };

    setCertificate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));

    setSelectedElement(newId);
  };

  const updateElement = (id: string, updates: Partial<CertificateElement>) => {
    setCertificate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    }));
  };

  const deleteElement = (id: string) => {
    setCertificate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    setSelectedElement(null);
  };

  const handleElementSelect = (id: string | null) => {
    setSelectedElement(id);
    if (id) {
      setActiveTab("element");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {error && (
        <div className="lg:col-span-3 bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div ref={canvasRef} className="relative">
            <CertificatePreview
              certificate={certificate}
              selectedElement={selectedElement}
              onSelectElement={handleElementSelect}
              onUpdateElement={updateElement}
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={resetToDefault}
              disabled={isGenerating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => addElement("text")}
              disabled={isGenerating}
            >
              <TextIcon className="mr-2 h-4 w-4" />
              Add Text
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => addElement("image")}
              disabled={isGenerating}
            >
              <Image className="mr-2 h-4 w-4" />
              Add Image
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => addElement("shape")}
              disabled={isGenerating}
            >
              <Square className="mr-2 h-4 w-4" />
              Add Shape
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => addElement("badge")}
              disabled={isGenerating}
            >
              <Award className="mr-2 h-4 w-4" />
              Add Badge
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={printCertificate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              Print
            </Button>
            <Button 
              onClick={downloadCertificate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="content">
              <Type className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="design">
              <Palette className="h-4 w-4 mr-2" />
              Design
            </TabsTrigger>
            <TabsTrigger value="template">
              <ImageIcon className="h-4 w-4 mr-2" />
              Template
            </TabsTrigger>
            <TabsTrigger value="element" disabled={!selectedElement}>
              <Plus className="h-4 w-4 mr-2" />
              Element
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={certificate.recipientName}
                    onChange={(e) => {
                      handleInputChange("recipientName", e.target.value);
                      updateElement("recipient-name", { content: e.target.value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Certificate Title</Label>
                  <Input
                    id="title"
                    value={certificate.title}
                    onChange={(e) => {
                      handleInputChange("title", e.target.value);
                      updateElement("title", { content: e.target.value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuerName">Issuer Name</Label>
                  <Input
                    id="issuerName"
                    value={certificate.issuerName}
                    onChange={(e) => {
                      handleInputChange("issuerName", e.target.value);
                      updateElement("signature-title", {
                        content: `${certificate.signatureTitle}, ${e.target.value}`,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    value={certificate.issueDate}
                    onChange={(e) => {
                      handleInputChange("issueDate", e.target.value);
                      updateElement("date", { content: e.target.value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Signature Name</Label>
                  <Input
                    id="signature"
                    value={certificate.signature}
                    onChange={(e) => {
                      handleInputChange("signature", e.target.value);
                      updateElement("signature", { content: e.target.value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signatureTitle">Signature Title</Label>
                  <Input
                    id="signatureTitle"
                    value={certificate.signatureTitle}
                    onChange={(e) => {
                      handleInputChange("signatureTitle", e.target.value);
                      updateElement("signature-title", {
                        content: `${e.target.value}, ${certificate.issuerName}`,
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Default Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="fontSize"
                      min={12}
                      max={48}
                      step={1}
                      value={[certificate.fontSize]}
                      onValueChange={(value) => handleInputChange("fontSize", value[0])}
                    />
                    <span className="w-12 text-center">{certificate.fontSize}px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <ColorPicker
                    color={certificate.textColor}
                    onChange={(color) => handleInputChange("textColor", color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <ColorPicker
                    color={certificate.accentColor}
                    onChange={(color) => handleInputChange("accentColor", color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <ColorPicker
                    color={certificate.backgroundColor}
                    onChange={(color) => handleInputChange("backgroundColor", color)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Background Image</Label>
                  <Input
                    id="backgroundImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="cursor-pointer"
                  />
                  {certificate.backgroundImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange("backgroundImage", null)}
                      className="mt-2"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <TemplateSelector 
                  selectedTemplate={certificate.template} 
                  onSelectTemplate={handleTemplateChange} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="element" className="space-y-4">
            {selectedElement && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Edit Element</h3>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteElement(selectedElement)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <ElementEditor
                    element={certificate.elements.find((el) => el.id === selectedElement)!}
                    onUpdate={(updates) => updateElement(selectedElement, updates)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CertificateGenerator;