/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import html2canvas from "html2canvas-pro"
import { jsPDF } from "jspdf";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Download,
  ImageIcon,
  Layers,
  Save,
  Text,
  Trash2,
  Upload,
  X,
} from "lucide-react"

// Types
interface CertificateElement {
  id: string
  type: "text" | "image"
  content: string
  x: number
  y: number
  width?: number
  height?: number
  fontSize?: number
  color?: string
  fontFamily?: string
  fontWeight?: string
  zIndex: number
  textAlign?: "left" | "center" | "right"
  borderColor?: string
  borderWidth?: number
  borderStyle?: "solid" | "dashed" | "dotted"
  borderRadius?: number
}

interface PageBorder {
  color: string
  width: number
  style: "solid" | "dashed" | "dotted"
  radius: number
}

interface Certificate {
  id?: string
  name: string
  bgImage: string
  elements: CertificateElement[]
  createdAt?: string
  updatedAt?: string
}

// Constants
const CERTIFICATE_WIDTH = 800
const CERTIFICATE_HEIGHT = 600

const DEFAULT_PAGE_BORDER: PageBorder = {
  color: "#2c3e50",
  width: 5,
  style: "solid",
  radius: 10,
}

const API_BASE_URL = "http://localhost:8080/api"

const CertificateMaker: React.FC = () => {
  // State
  const [certificate, setCertificate] = useState<Certificate>({
    name: "New Certificate",
    bgImage: "",
    elements: [],
  })
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pageBorder, setPageBorder] = useState<PageBorder>(DEFAULT_PAGE_BORDER)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificatesList, setCertificatesList] = useState<Certificate[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [certificateName, setCertificateName] = useState("New Certificate")
  const certificateRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })
  const [showElementPanel, setShowElementPanel] = useState(true)
  const [showBorderPanel, setShowBorderPanel] = useState(true)
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(true)
  const [isEditingText, setIsEditingText] = useState(false)

  const { elements, bgImage } = certificate

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch list of saved certificates
        const listResponse = await fetch(`${API_BASE_URL}/certificates`)
        if (!listResponse.ok) throw new Error("Failed to fetch certificates")
        const listData = await listResponse.json()
        setCertificatesList(listData)

        // Fetch default certificate template
        const defaultResponse = await fetch(`${API_BASE_URL}/certificates/default`)
        if (!defaultResponse.ok) throw new Error("Failed to fetch default certificate")
        const defaultData = await defaultResponse.json()

        setCertificate({
          ...defaultData,
          name: "New Certificate",
        })
        setCertificateName("New Certificate")
        setError(null)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Using fallback certificate.")
        setCertificate({
          name: "New Certificate",
          bgImage: "",
          elements: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Certificate management functions
  const saveCertificate = async () => {
    try {
      setIsLoading(true)

      // Prepare the certificate data with current timestamp
      const certToSave = {
        ...certificate,
        name: certificateName,
        updatedAt: new Date().toISOString(),
        createdAt: certificate.createdAt || new Date().toISOString(),
      }

      const response = await fetch(`${API_BASE_URL}/certificates/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(certToSave),
      })

      if (!response.ok) {
        throw new Error(`Failed to save certificate: ${response.statusText}`)
      }

      const savedCert = await response.json()

      // Update state with the saved certificate (including the ID from server)
      setCertificate(savedCert)
      setCertificateName(savedCert.name)

      // Refresh certificates list
      const listResponse = await fetch(`${API_BASE_URL}/certificates`)
      if (listResponse.ok) {
        const updatedList = await listResponse.json()
        setCertificatesList(updatedList)
      }

      setShowSaveModal(false)
      setError(null)
    } catch (err: any) {
      console.error("Error saving certificate:", err)
      setError(err.message || "Failed to save certificate")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCertificate = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/certificates/load?id=${id}`)
      if (!response.ok) throw new Error("Failed to load certificate")

      const loadedCert = await response.json()
      setCertificate(loadedCert)
      setCertificateName(loadedCert.name)
      setError(null)
    } catch (err: any) {
      console.error("Error loading certificate:", err)
      setError("Failed to load certificate")
    } finally {
      setIsLoading(false)
    }
  }

  // Element manipulation functions
  const addTextElement = () => {
    const newElement: CertificateElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "Double click to edit",
      x: CERTIFICATE_WIDTH / 2,
      y: CERTIFICATE_HEIGHT / 2,
      fontSize: 24,
      color: "#000000",
      fontFamily: "Arial",
      zIndex: elements.length > 0 ? Math.max(...elements.map((el) => el.zIndex)) + 1 : 1,
      textAlign: "center",
      borderColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      borderRadius: 0,
    }

    setCertificate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString(),
    }))
    setSelectedElement(newElement.id)
  }

  const addImageElement = () => {
    const newElement: CertificateElement = {
      id: `image-${Date.now()}`,
      type: "image",
      content: "",
      x: CERTIFICATE_WIDTH / 2,
      y: CERTIFICATE_HEIGHT / 2,
      width: 150,
      height: 150,
      zIndex: elements.length > 0 ? Math.max(...elements.map((el) => el.zIndex)) + 1 : 1,
      borderColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      borderRadius: 0,
    }

    setCertificate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString(),
    }))
    setSelectedElement(newElement.id)
  }

  const handleElementChange = (id: string, updates: Partial<CertificateElement>) => {
    setCertificate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          handleElementChange(id, {
            content: event.target?.result as string,
            width: img.width > 300 ? 300 : img.width,
            height: img.height > 300 ? 300 : img.height,
          })
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCertificate((prev) => ({
          ...prev,
          bgImage: event.target?.result as string,
          updatedAt: new Date().toISOString(),
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteElement = (id: string) => {
    setCertificate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      updatedAt: new Date().toISOString(),
    }))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  // Layer ordering functions
  const sendForward = (id: string) => {
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const nextZIndex = Math.max(...elements.map((el) => el.zIndex)) + 1
    handleElementChange(id, { zIndex: nextZIndex })
  }

  const sendBackward = (id: string) => {
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const minZIndex = Math.min(...elements.map((el) => el.zIndex))
    if (element.zIndex > minZIndex) {
      handleElementChange(id, { zIndex: element.zIndex - 1 })
    }
  }

  const sendToBack = (id: string) => {
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const minZIndex = Math.min(...elements.map((el) => el.zIndex))
    handleElementChange(id, { zIndex: minZIndex - 1 })
  }

  // Download functionality
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      // First create a high-quality PNG using html2canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // Create a new PDF with the same dimensions as the certificate
      const pdf = new jsPDF({
        orientation: CERTIFICATE_WIDTH > CERTIFICATE_HEIGHT ? "landscape" : "portrait",
        unit: "px",
        format: [CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT]
      });

      // Convert the canvas to an image data URL
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Add the image to the PDF, filling the entire page
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        CERTIFICATE_WIDTH,
        CERTIFICATE_HEIGHT,
        undefined,
        "FAST"
      );

      // Save the PDF
      pdf.save(`${certificateName || "certificate"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF");
    }
  };

  // Update the Download button in your JSX to indicate PDF format:
  <button
    className={`py-2 px-4 rounded-md font-medium transition-colors flex items-center gap-2 ${!elements.length && !bgImage ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
      }`}
    onClick={downloadCertificate}
    disabled={!elements.length && !bgImage}
  >
    <Download size={18} />
    Download PDF
  </button>

  // Drag and drop functionality
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent event from bubbling up
    const element = elements.find((el) => el.id === id)
    if (!element) return

    setSelectedElement(id)

    // Don't start dragging if we're editing text
    if (isEditingText) return

    // Check if the target is the element container or a child that should trigger dragging
    // This is the key fix for text dragging - we need to check if we're clicking on the element container
    const isElementContainer = (e.currentTarget as HTMLElement).getAttribute("data-element-container") === "true"

    if (isElementContainer) {
      setIsDragging(true)
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      setDragOffset({
        x: offsetX,
        y: offsetY,
      })

      dragStartPos.current = {
        x: element.x,
        y: element.y,
      }

      document.body.style.userSelect = "none"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return

    const certificate = certificateRef.current
    if (!certificate) return

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      const rect = certificate.getBoundingClientRect()
      const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, CERTIFICATE_WIDTH))
      const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, CERTIFICATE_HEIGHT))

      handleElementChange(selectedElement, {
        x: x,
        y: y,
      })

      if (certificateRef.current) {
        certificateRef.current.style.cursor = "grabbing"
      }
    })
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)

      if (certificateRef.current) {
        certificateRef.current.style.cursor = "default"
      }

      document.body.style.userSelect = ""
    }
  }

  const handleMouseLeave = () => {
    handleMouseUp()
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the container (not a child element)
    // and we're not currently editing text
    if (e.target === e.currentTarget && !isEditingText) {
      setSelectedElement(null)
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return

      const moveAmount = e.shiftKey ? 10 : 1
      let newX, newY

      const element = elements.find((el) => el.id === selectedElement)
      if (!element) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          newY = Math.max(0, element.y - moveAmount)
          handleElementChange(selectedElement, { y: newY })
          break
        case "ArrowDown":
          e.preventDefault()
          newY = Math.min(CERTIFICATE_HEIGHT, element.y + moveAmount)
          handleElementChange(selectedElement, { y: newY })
          break
        case "ArrowLeft":
          e.preventDefault()
          newX = Math.max(0, element.x - moveAmount)
          handleElementChange(selectedElement, { x: newX })
          break
        case "ArrowRight":
          e.preventDefault()
          newX = Math.min(CERTIFICATE_WIDTH, element.x + moveAmount)
          handleElementChange(selectedElement, { x: newX })
          break
        case "Delete":
          e.preventDefault()
          deleteElement(selectedElement)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElement])

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-2xl text-gray-700 font-semibold">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-6 w-6 border-4 border-gray-500 border-t-transparent rounded-full"></div>
            Loading certificate editor...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-xl text-red-500 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Controls Panel */}
      <div className="bg-gray-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-400">Certificate Designer</h2>

          <div className="flex space-x-3">
            <button
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              onClick={() => setShowSaveModal(true)}
            >
              <Save size={18} />
              Save Certificate
            </button>

            <select
              className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onChange={(e) => loadCertificate(e.target.value)}
              value=""
            >
              <option value="">Load Certificate...</option>
              {certificatesList.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name} - {new Date(cert.updatedAt || "").toLocaleDateString()}
                </option>
              ))}
            </select>

            <button
              className={`py-2 px-4 rounded-md font-medium transition-colors flex items-center gap-2 ${!elements.length && !bgImage ? "bg-gray-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
                }`}
              onClick={downloadCertificate}
              disabled={!elements.length && !bgImage}
            >
              <Download size={18} />
              Download
            </button>
          </div>
        </div>

        {/* Element Editing Panel - Only shown when an element is selected */}
        {selectedElement && (
          <div
            className="mt-4 bg-gray-700 p-4 rounded-lg shadow-inner"
            onClick={(e) => e.stopPropagation()} // Prevent click from reaching container
          >
            <div className="flex flex-wrap gap-4 items-center">
              {elements.find((el) => el.id === selectedElement)?.type === "text" && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Text:</label>
                    <input
                      type="text"
                      value={elements.find((el) => el.id === selectedElement)?.content || ""}
                      onChange={(e) => handleElementChange(selectedElement, { content: e.target.value })}
                      className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Font Size:</label>
                    <input
                      type="number"
                      value={elements.find((el) => el.id === selectedElement)?.fontSize || 24}
                      onChange={(e) =>
                        handleElementChange(selectedElement, { fontSize: Number.parseInt(e.target.value) })
                      }
                      className="w-20 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={elements.find((el) => el.id === selectedElement)?.color || "#000000"}
                        onChange={(e) => handleElementChange(selectedElement, { color: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded-md border border-gray-600"
                      />
                      <span className="text-xs text-gray-300">
                        {elements.find((el) => el.id === selectedElement)?.color}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Font:</label>
                    <select
                      value={elements.find((el) => el.id === selectedElement)?.fontFamily || "Arial"}
                      onChange={(e) => handleElementChange(selectedElement, { fontFamily: e.target.value })}
                      className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="cursive">Cursive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Alignment:</label>
                    <select
                      value={elements.find((el) => el.id === selectedElement)?.textAlign || "center"}
                      onChange={(e) =>
                        handleElementChange(selectedElement, {
                          textAlign: e.target.value as "left" | "center" | "right",
                        })
                      }
                      className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </>
              )}

              {elements.find((el) => el.id === selectedElement)?.type === "image" && (
                <>
                  <div>
                    <label className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md cursor-pointer text-sm transition-colors items-center gap-2">
                      <Upload size={16} />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, selectedElement)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Width:</label>
                    <input
                      type="number"
                      value={elements.find((el) => el.id === selectedElement)?.width || 150}
                      onChange={(e) => handleElementChange(selectedElement, { width: Number.parseInt(e.target.value) })}
                      className="w-20 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Height:</label>
                    <input
                      type="number"
                      value={elements.find((el) => el.id === selectedElement)?.height || 150}
                      onChange={(e) =>
                        handleElementChange(selectedElement, { height: Number.parseInt(e.target.value) })
                      }
                      className="w-20 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </>
              )}

              {/* Common element controls */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-300">Position X:</label>
                <input
                  type="number"
                  value={elements.find((el) => el.id === selectedElement)?.x || 0}
                  onChange={(e) => handleElementChange(selectedElement, { x: Number.parseInt(e.target.value) })}
                  className="w-20 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-300">Position Y:</label>
                <input
                  type="number"
                  value={elements.find((el) => el.id === selectedElement)?.y || 0}
                  onChange={(e) => handleElementChange(selectedElement, { y: Number.parseInt(e.target.value) })}
                  className="w-20 bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex space-x-2 items-center">
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
                  onClick={() => sendBackward(selectedElement)}
                  title="Send Backward"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
                  onClick={() => sendForward(selectedElement)}
                  title="Send Forward"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
                  onClick={() => sendToBack(selectedElement)}
                  title="Send to Back"
                >
                  <Layers size={16} />
                </button>
              </div>

              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
                onClick={() => deleteElement(selectedElement)}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-gray-800 text-white p-4 overflow-y-auto">
          {/* Page Border Controls */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <div
              className="flex justify-between items-center cursor-pointer mb-3"
              onClick={() => setShowBorderPanel(!showBorderPanel)}
            >
              <h3 className="text-lg font-semibold text-gray-100">Page Border</h3>
              {showBorderPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {showBorderPanel && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageBorder.color}
                        onChange={(e) => setPageBorder({ ...pageBorder, color: e.target.value })}
                        className="h-9 w-9 cursor-pointer rounded-md border border-gray-600"
                      />
                      <span className="text-xs text-gray-300">{pageBorder.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Width (px):</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={pageBorder.width}
                      onChange={(e) => setPageBorder({ ...pageBorder, width: Number.parseInt(e.target.value) })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Style:</label>
                    <select
                      value={pageBorder.style}
                      onChange={(e) =>
                        setPageBorder({ ...pageBorder, style: e.target.value as "solid" | "dashed" | "dotted" })
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-300">Radius (px):</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={pageBorder.radius}
                      onChange={(e) => setPageBorder({ ...pageBorder, radius: Number.parseInt(e.target.value) })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Background Controls */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <div
              className="flex justify-between items-center cursor-pointer mb-3"
              onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
            >
              <h3 className="text-lg font-semibold text-gray-100">Background</h3>
              {showBackgroundPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {showBackgroundPanel && (
              <>
                <label className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md cursor-pointer mb-3 transition-colors w-full text-center items-center justify-center gap-2">
                  <Upload size={18} />
                  Upload Background
                  <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                </label>
                {bgImage && (
                  <button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors w-full flex items-center justify-center gap-2"
                    onClick={() => setCertificate((prev) => ({ ...prev, bgImage: "" }))}
                  >
                    <X size={18} />
                    Remove Background
                  </button>
                )}
              </>
            )}
          </div>

          {/* Add Elements */}
          <div className="mb-6">
            <div
              className="flex justify-between items-center cursor-pointer mb-3"
              onClick={() => setShowElementPanel(!showElementPanel)}
            >
              <h3 className="text-lg font-semibold text-gray-100">Add Elements</h3>
              {showElementPanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {showElementPanel && (
              <div className="flex space-x-3">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors flex-1 flex items-center justify-center gap-2"
                  onClick={addTextElement}
                >
                  <Text size={18} />
                  Add Text
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors flex-1 flex items-center justify-center gap-2"
                  onClick={addImageElement}
                >
                  <ImageIcon size={18} />
                  Add Image
                </button>
              </div>
            )}
          </div>

          <div className="text-gray-400 text-sm mt-8">
            <h4 className="font-medium text-gray-300 mb-2">Keyboard Shortcuts:</h4>
            <ul className="space-y-1">
              <li>Arrow keys: Move element 1px</li>
              <li>Shift + Arrow keys: Move element 10px</li>
              <li>Delete: Remove selected element</li>
            </ul>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="flex-1 p-6 overflow-auto flex justify-center items-center bg-gray-100">
          <div
            className="relative bg-white shadow-xl"
            ref={certificateRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleContainerClick}
            style={{
              backgroundImage: bgImage ? `url(${bgImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: `${CERTIFICATE_WIDTH}px`,
              height: `${CERTIFICATE_HEIGHT}px`,
              cursor: isDragging ? "grabbing" : "default",
              borderColor: pageBorder.color,
              borderWidth: `${pageBorder.width}px`,
              borderStyle: pageBorder.style,
              borderRadius: `${pageBorder.radius}px`,
              padding: `${pageBorder.width}px`,
            }}
          >
            {[...elements]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((element) => {
                const isSelected = selectedElement === element.id;
                const isImage = element.type === "image";
                const isCentered = element.textAlign === "center";

                return (
                  <div
                    key={element.id}
                    data-element-container="true"
                    className={`absolute ${isSelected ? 'outline-dashed outline-2 outline-cyan-500 bg-cyan-500 bg-opacity-10' : 'hover:outline-dotted hover:outline-1 hover:outline-gray-400'}`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: isImage ? `${element.width}px` : 'max-content',
                      height: isImage ? `${element.height}px` : 'auto',
                      transform: isCentered ? 'translateX(-50%)' : 'none',
                      zIndex: element.zIndex,
                      cursor: isDragging && isSelected ? 'grabbing' : 'move',
                      userSelect: 'none',
                      // For images specifically
                      ...(isImage && {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      })
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    {element.type === 'text' ? (
                      <div
                        contentEditable
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setIsEditingText(true)
                        }}
                        onBlur={(e) => {
                          handleElementChange(element.id, { content: e.currentTarget.textContent || "" })
                          setIsEditingText(false)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        suppressContentEditableWarning
                        className="focus:outline-none"
                        style={{
                          display: "inline-block",
                          textAlign: element.textAlign || "left",
                          pointerEvents: isDragging ? "none" : "auto",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          width: "100%",
                          // Ensure font properties are properly applied
                          fontSize: `${element.fontSize}px`,
                          fontFamily: element.fontFamily || "Arial",
                          fontWeight: element.fontWeight || "normal",
                          color: element.color || "#000000",
                        }}
                      >
                        {element.content}
                      </div>
                    ) : (
                      element.content && (
                        <img
                          src={element.content}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                            // Remove transform from img if parent has it
                            transform: isCentered ? 'none' : undefined
                          }}
                        />
                      )
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Save Certificate</h3>
            {error && <div className="mb-4 p-3 bg-red-500 text-white rounded-md text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Certificate Name:</label>
              <input
                type="text"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition-colors"
                onClick={() => {
                  setShowSaveModal(false)
                  setError(null)
                }}
              >
                Cancel
              </button>
              <button
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                onClick={saveCertificate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificateMaker
