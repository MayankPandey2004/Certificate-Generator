"use client"

import React, { useRef } from "react"
import Draggable from "react-draggable"
import type { Certificate, CertificateElement } from "../lib/types"
import { Award, ImageIcon } from "lucide-react"

interface CertificatePreviewProps {
  certificate: Certificate
  selectedElement: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<CertificateElement>) => void
}

const CertificatePreview = ({
  certificate,
  selectedElement,
  onSelectElement,
  onUpdateElement,
}: CertificatePreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Apply template-specific styles based on the selected template
  const getTemplateStyles = () => {
    switch (certificate.template) {
      case "modern":
        return "border-4 border-solid"
      case "elegant":
        return "border-double border-8"
      case "minimalist":
        return "border-t-2 border-b-2"
      case "classic":
      default:
        return "border-8 border-double"
    }
  }

  const handleDragStop = (id: string, _e: unknown, data: { x: number; y: number }) => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    // Convert pixel position to percentage
    const xPercent = (data.x / containerWidth) * 100
    const yPercent = (data.y / containerHeight) * 100

    onUpdateElement(id, { x: xPercent, y: yPercent })
  }

  const getElementPosition = (element: CertificateElement) => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const containerWidth = containerRef.current.offsetWidth
    const containerHeight = containerRef.current.offsetHeight

    // Convert percentage to pixels for draggable
    const x = (element.x / 100) * containerWidth
    const y = (element.y / 100) * containerHeight

    return { x, y }
  }

  const renderElement = (element: CertificateElement) => {
    const position = getElementPosition(element)
    const isSelected = selectedElement === element.id
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const draggableRef = useRef<HTMLDivElement>(null)

    const elementWidth = `${element.width}%`

    const elementStyle: React.CSSProperties = {
      position: "absolute",
      width: elementWidth,
      color: element.color || certificate.textColor,
      fontSize: `${element.fontSize}px`,
      fontWeight: element.fontWeight || "normal",
      textAlign: (element.textAlign as React.CSSProperties['textAlign']) || "center",
      fontFamily: element.fontFamily === "script" ? "'Brush Script MT', cursive" : "inherit",
      cursor: "move",
      userSelect: "none",
      border: isSelected ? "1px dashed #4f46e5" : "none",
      padding: isSelected ? "4px" : "0",
      backgroundColor: isSelected ? "rgba(79, 70, 229, 0.1)" : "transparent",
    }

    let content: React.ReactNode

    switch (element.type) {
      case "text":
        content = <div style={elementStyle}>{element.content}</div>
        break
      case "image":
        content = (
          <div style={elementStyle} className="flex items-center justify-center">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt="Certificate element"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">Image Placeholder</span>
              </div>
            )}
          </div>
        )
        break
      case "shape":
        content = (
          <div style={elementStyle} className="flex items-center justify-center">
            <div
              style={{
                backgroundColor: element.color || certificate.accentColor,
                width: "100%",
                height: "100%",
                minHeight: "40px",
                borderRadius: element.shape === "circle" ? "50%" : "0",
              }}
            />
          </div>
        )
        break
      case "badge":
        content = (
          <div style={elementStyle} className="flex items-center justify-center">
            <Award
              size={element.fontSize ? element.fontSize * 2 : 48}
              color={element.color || certificate.accentColor}
            />
          </div>
        )
        break
      default:
        content = null
    }

    return (
      <Draggable
        key={element.id}
        position={position}
        onStop={(_e, data) => handleDragStop(element.id, _e, data)}
        bounds="parent"
        nodeRef={draggableRef as React.RefObject<HTMLElement>} // Type assertion here
      >
        <div
          ref={draggableRef}
          onClick={(e) => {
            e.stopPropagation()
            onSelectElement(element.id)
          }}
        >
          {content}
        </div>
      </Draggable>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[1.414/1] ${getTemplateStyles()}`}
      style={{
        backgroundColor: certificate.backgroundColor,
        color: certificate.textColor,
        borderColor: certificate.accentColor,
        backgroundImage: certificate.backgroundImage ? `url(${certificate.backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={() => onSelectElement(null)}
    >
      {certificate.elements.map(renderElement)}
    </div>
  )
}

export default CertificatePreview