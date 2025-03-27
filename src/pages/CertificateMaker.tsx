import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';

interface CertificateElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  zIndex: number;
  textAlign?: 'left' | 'center' | 'right';
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
}

interface PageBorder {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  radius: number;
}

const CERTIFICATE_WIDTH = 800;
const CERTIFICATE_HEIGHT = 600;

const DEFAULT_CERTIFICATE: { 
  bgImage: string;
  elements: CertificateElement[];
} = {
  bgImage: '',
  elements: [
    {
      id: 'title',
      type: 'text' as const,
      content: 'CERTIFICATE OF ACHIEVEMENT',
      x: CERTIFICATE_WIDTH / 2,
      y: 100,
      fontSize: 36,
      color: '#2c3e50',
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      zIndex: 1,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    },
    {
      id: 'recipient',
      type: 'text' as const,
      content: 'This certificate is awarded to [Recipient Name]',
      x: CERTIFICATE_WIDTH / 2,
      y: 200,
      fontSize: 20,
      color: '#2c3e50',
      fontFamily: 'Times New Roman',
      zIndex: 2,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    },
    {
      id: 'description',
      type: 'text' as const,
      content: 'For outstanding performance and dedication',
      x: CERTIFICATE_WIDTH / 2,
      y: 250,
      fontSize: 20,
      color: '#2c3e50',
      fontFamily: 'Times New Roman',
      zIndex: 3,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    },
    {
      id: 'date',
      type: 'text' as const,
      content: 'Date: ' + new Date().toLocaleDateString(),
      x: CERTIFICATE_WIDTH / 2,
      y: 350,
      fontSize: 18,
      color: '#2c3e50',
      fontFamily: 'Times New Roman',
      zIndex: 4,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    },
    {
      id: 'signature',
      type: 'text' as const,
      content: 'Authorized Signature',
      x: CERTIFICATE_WIDTH / 2,
      y: 450,
      fontSize: 18,
      color: '#2c3e50',
      fontFamily: 'Times New Roman',
      zIndex: 5,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    }
  ]
};

const DEFAULT_PAGE_BORDER: PageBorder = {
  color: '#2c3e50',
  width: 5,
  style: 'solid',
  radius: 10
};

const CertificateMaker: React.FC = () => {
  const [elements, setElements] = useState<CertificateElement[]>(DEFAULT_CERTIFICATE.elements);
  const [bgImage, setBgImage] = useState<string>(DEFAULT_CERTIFICATE.bgImage);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pageBorder, setPageBorder] = useState<PageBorder>(DEFAULT_PAGE_BORDER);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elements.length === 0) {
      setElements(DEFAULT_CERTIFICATE.elements);
    }
  }, [elements.length]);

  const addTextElement = () => {
    const newElement: CertificateElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit',
      x: CERTIFICATE_WIDTH / 2,
      y: CERTIFICATE_HEIGHT / 2,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial',
      zIndex: elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) + 1 : 1,
      textAlign: 'center',
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addImageElement = () => {
    const newElement: CertificateElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: '',
      x: CERTIFICATE_WIDTH / 2,
      y: CERTIFICATE_HEIGHT / 2,
      width: 150,
      height: 150,
      zIndex: elements.length > 0 ? Math.max(...elements.map(el => el.zIndex)) + 1 : 1,
      borderColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderRadius: 0
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const handleElementChange = (id: string, updates: Partial<CertificateElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          handleElementChange(id, { 
            content: event.target?.result as string,
            width: img.width > 300 ? 300 : img.width,
            height: img.height > 300 ? 300 : img.height
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const sendForward = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const nextZIndex = Math.max(...elements.map(el => el.zIndex)) + 1;
    handleElementChange(id, { zIndex: nextZIndex });
  };

  const sendBackward = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const minZIndex = Math.min(...elements.map(el => el.zIndex));
    if (element.zIndex > minZIndex) {
      handleElementChange(id, { zIndex: element.zIndex - 1 });
    }
  };

  const sendToFront = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const maxZIndex = Math.max(...elements.map(el => el.zIndex));
    handleElementChange(id, { zIndex: maxZIndex + 1 });
  };

  const sendToBack = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const minZIndex = Math.min(...elements.map(el => el.zIndex));
    handleElementChange(id, { zIndex: minZIndex - 1 });
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      const node = certificateRef.current.cloneNode(true) as HTMLElement;
      node.style.position = 'absolute';
      node.style.left = '-9999px';
      node.style.backgroundColor = '#ffffff';
      
      const allElements = node.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);
        
        if (computedStyle.backgroundColor.includes('oklch')) {
          htmlEl.style.backgroundColor = htmlEl.style.backgroundColor || '#ffffff';
        }
        
        if (computedStyle.color.includes('oklch')) {
          htmlEl.style.color = htmlEl.style.color || '#000000';
        }
      });

      document.body.appendChild(node);

      const canvas = await html2canvas(node, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = 'certificate.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      document.body.removeChild(node);
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    setSelectedElement(id);
    
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const certificate = certificateRef.current;
    if (!certificate) return;

    const rect = certificate.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    handleElementChange(selectedElement, { x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElement(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f7fa]">
      {/* Controls Panel */}
      <div className="w-72 bg-[#2c3e50] text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-[#3498db]">Certificate Designer</h2>
        
        {/* Page Border Controls */}
        <div className="mb-6 pb-6 border-b border-[#34495e]">
          <h3 className="text-lg font-semibold mb-3 text-[#ecf0f1]">Page Border</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Color:</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={pageBorder.color}
                  onChange={(e) => setPageBorder({...pageBorder, color: e.target.value})}
                  className="h-8 w-8 cursor-pointer"
                />
                <span className="ml-2 text-xs">
                  {pageBorder.color}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Width (px):</label>
              <input
                type="number"
                min="0"
                max="20"
                value={pageBorder.width}
                onChange={(e) => setPageBorder({...pageBorder, width: parseInt(e.target.value)})}
                className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Style:</label>
              <select
                value={pageBorder.style}
                onChange={(e) => setPageBorder({...pageBorder, style: e.target.value as 'solid' | 'dashed' | 'dotted'})}
                className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Radius (px):</label>
              <input
                type="number"
                min="0"
                max="50"
                value={pageBorder.radius}
                onChange={(e) => setPageBorder({...pageBorder, radius: parseInt(e.target.value)})}
                className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 pb-6 border-b border-[#34495e]">
          <h3 className="text-lg font-semibold mb-3 text-[#ecf0f1]">Background</h3>
          <label className="inline-block bg-[#3498db] hover:bg-[#2980b9] text-white px-4 py-2 rounded cursor-pointer mb-2 transition-colors">
            Upload Background
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBgImageUpload} 
              className="hidden" 
            />
          </label>
          {bgImage && (
            <button 
              className="bg-[#f39c12] hover:bg-[#d35400] text-white px-4 py-2 rounded transition-colors w-full"
              onClick={() => setBgImage('')}
            >
              Remove Background
            </button>
          )}
        </div>

        <div className="mb-6 pb-6 border-b border-[#34495e]">
          <h3 className="text-lg font-semibold mb-3 text-[#ecf0f1]">Add Elements</h3>
          <div className="flex space-x-2">
            <button 
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded transition-colors flex-1"
              onClick={addTextElement}
            >
              Add Text
            </button>
            <button 
              className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-4 py-2 rounded transition-colors flex-1"
              onClick={addImageElement}
            >
              Add Image
            </button>
          </div>
        </div>

        {selectedElement && (
          <div className="mb-6 bg-[#34495e] p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-[#ecf0f1]">Element Properties</h3>
            {elements.find(el => el.id === selectedElement)?.type === 'text' && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Text:</label>
                  <input
                    type="text"
                    value={elements.find(el => el.id === selectedElement)?.content || ''}
                    onChange={(e) => handleElementChange(selectedElement, { content: e.target.value })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Font Size:</label>
                  <input
                    type="number"
                    value={elements.find(el => el.id === selectedElement)?.fontSize || 24}
                    onChange={(e) => handleElementChange(selectedElement, { fontSize: parseInt(e.target.value) })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Color:</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={elements.find(el => el.id === selectedElement)?.color || '#000000'}
                      onChange={(e) => handleElementChange(selectedElement, { color: e.target.value })}
                      className="h-10 w-10 cursor-pointer"
                    />
                    <span className="ml-2 text-sm">
                      {elements.find(el => el.id === selectedElement)?.color || '#000000'}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Font Family:</label>
                  <select
                    value={elements.find(el => el.id === selectedElement)?.fontFamily || 'Arial'}
                    onChange={(e) => handleElementChange(selectedElement, { fontFamily: e.target.value })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="cursive">Cursive</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Font Weight:</label>
                  <select
                    value={elements.find(el => el.id === selectedElement)?.fontWeight || 'normal'}
                    onChange={(e) => handleElementChange(selectedElement, { fontWeight: e.target.value })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Light</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Text Alignment:</label>
                  <select
                    value={elements.find(el => el.id === selectedElement)?.textAlign || 'center'}
                    onChange={(e) => handleElementChange(selectedElement, { 
                      textAlign: e.target.value as 'left' | 'center' | 'right' 
                    })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </>
            )}
            {elements.find(el => el.id === selectedElement)?.type === 'image' && (
              <>
                <div className="mb-4">
                  <label className="inline-block bg-[#3498db] hover:bg-[#2980b9] text-white px-4 py-2 rounded cursor-pointer transition-colors w-full text-center">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, selectedElement)}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Width:</label>
                  <input
                    type="number"
                    value={elements.find(el => el.id === selectedElement)?.width || 150}
                    onChange={(e) => handleElementChange(selectedElement, { width: parseInt(e.target.value) })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-[#bdc3c7]">Height:</label>
                  <input
                    type="number"
                    value={elements.find(el => el.id === selectedElement)?.height || 150}
                    onChange={(e) => handleElementChange(selectedElement, { height: parseInt(e.target.value) })}
                    className="w-full bg-[#2c3e50] text-white px-3 py-2 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
              </>
            )}

            {/* Element Border Controls */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-[#bdc3c7]">Element Border</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Color:</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={elements.find(el => el.id === selectedElement)?.borderColor || 'transparent'}
                      onChange={(e) => handleElementChange(selectedElement, { borderColor: e.target.value })}
                      className="h-8 w-8 cursor-pointer"
                    />
                    <span className="ml-2 text-xs">
                      {elements.find(el => el.id === selectedElement)?.borderColor || 'transparent'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Width (px):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={elements.find(el => el.id === selectedElement)?.borderWidth || 0}
                    onChange={(e) => handleElementChange(selectedElement, { borderWidth: parseInt(e.target.value) })}
                    className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Style:</label>
                  <select
                    value={elements.find(el => el.id === selectedElement)?.borderStyle || 'solid'}
                    onChange={(e) => handleElementChange(selectedElement, { 
                      borderStyle: e.target.value as 'solid' | 'dashed' | 'dotted' 
                    })}
                    className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-[#bdc3c7]">Radius (px):</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={elements.find(el => el.id === selectedElement)?.borderRadius || 0}
                    onChange={(e) => handleElementChange(selectedElement, { borderRadius: parseInt(e.target.value) })}
                    className="w-full bg-[#2c3e50] text-white px-2 py-1 rounded border border-[#34495e] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-[#bdc3c7]">Layer Order:</h4>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  className="bg-[#3498db] hover:bg-[#2980b9] text-white px-3 py-1 rounded text-sm transition-colors"
                  onClick={() => sendBackward(selectedElement)}
                >
                  Send Backward
                </button>
                <button 
                  className="bg-[#3498db] hover:bg-[#2980b9] text-white px-3 py-1 rounded text-sm transition-colors"
                  onClick={() => sendForward(selectedElement)}
                >
                  Send Forward
                </button>
                <button 
                  className="bg-[#3498db] hover:bg-[#2980b9] text-white px-3 py-1 rounded text-sm transition-colors col-span-2"
                  onClick={() => sendToBack(selectedElement)}
                >
                  Send to Back
                </button>
                <button 
                  className="bg-[#3498db] hover:bg-[#2980b9] text-white px-3 py-1 rounded text-sm transition-colors col-span-2"
                  onClick={() => sendToFront(selectedElement)}
                >
                  Bring to Front
                </button>
              </div>
            </div>

            <button 
              className="bg-[#e74c3c] hover:bg-[#c0392b] text-white px-4 py-2 rounded transition-colors w-full"
              onClick={() => deleteElement(selectedElement)}
            >
              Delete Element
            </button>
          </div>
        )}

        <button 
          className={`w-full py-3 px-4 rounded font-bold transition-colors ${(!elements.length && !bgImage) ? 'bg-[#95a5a6] cursor-not-allowed' : 'bg-[#9b59b6] hover:bg-[#8e44ad]'}`}
          onClick={downloadCertificate}
          disabled={!elements.length && !bgImage}
        >
          Download Certificate
        </button>
      </div>

      {/* Certificate Preview */}
      <div className="flex-1 p-6 overflow-auto flex justify-center items-center bg-[#f5f7fa]">
        <div 
          className="relative bg-white shadow-lg"
          ref={certificateRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onClick={handleContainerClick}
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: `${CERTIFICATE_WIDTH}px`,
            height: `${CERTIFICATE_HEIGHT}px`,
            cursor: isDragging ? 'grabbing' : 'default',
            borderColor: pageBorder.color,
            borderWidth: `${pageBorder.width}px`,
            borderStyle: pageBorder.style,
            borderRadius: `${pageBorder.radius}px`,
            padding: `${pageBorder.width}px`
          }}
        >
          {[...elements].sort((a, b) => a.zIndex - b.zIndex).map((element) => (
            <div
              key={element.id}
              className={`absolute p-2 transition-all ${selectedElement === element.id ? 'outline-dashed outline-2 outline-[#3498db] bg-[#3498db] bg-opacity-20' : ''}`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                fontSize: element.fontSize ? `${element.fontSize}px` : 'inherit',
                color: element.color || 'inherit',
                fontFamily: element.fontFamily || 'inherit',
                fontWeight: element.fontWeight || 'inherit',
                cursor: 'move',
                userSelect: 'none',
                zIndex: element.zIndex,
                transform: element.type === 'image' || (element.type === 'text' && element.textAlign === 'center') 
                  ? 'translateX(-50%)' 
                  : 'none',
                textAlign: element.textAlign || 'left',
                width: element.type === 'text' ? 'auto' : `${element.width}px`,
                borderColor: element.borderColor || 'transparent',
                borderWidth: element.borderWidth ? `${element.borderWidth}px` : '0',
                borderStyle: element.borderStyle || 'solid',
                borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
                padding: element.borderWidth ? '4px' : '0'
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
            >
              {element.type === 'text' ? (
                <div 
                  contentEditable 
                  onDoubleClick={(e) => e.stopPropagation()}
                  onBlur={(e) => handleElementChange(element.id, { content: e.currentTarget.textContent || '' })}
                  suppressContentEditableWarning
                  className="focus:outline-none"
                  style={{
                    display: 'inline-block',
                    textAlign: element.textAlign || 'left'
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
                      width: element.width ? `${element.width}px` : 'auto',
                      height: element.height ? `${element.height}px` : 'auto',
                      transform: 'translateX(-50%)'
                    }}
                    className="object-contain pointer-events-none" 
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateMaker;