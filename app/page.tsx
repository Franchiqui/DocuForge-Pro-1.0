'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Type, Layers, FileText, Save, Download,
  Upload, FolderOpen, Grid, ZoomIn, ZoomOut, Eye, Printer,
  ChevronLeft, ChevronRight, X, Plus, Trash2, Copy, GripVertical,
  Search, FolderPlus, FilePlus, MoreVertical, Maximize2, Minimize2,
  Check, Menu, Settings
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import Footer from '@/components/layout/footer';

type DocumentPage = {
  id: string;
  content: string;
  images: Array<{
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
};

type FontFamily = 'Inter' | 'Roboto' | 'Open Sans' | 'Montserrat' | 'Lato' | 'Playfair Display' | 'Custom';
type PageSize = 'A4' | 'Letter' | 'Legal' | 'A3';
type PageOrientation = 'portrait' | 'landscape';

export default function HomePage() {
  const [pages, setPages] = useState<DocumentPage[]>([
    { id: '1', content: '', images: [] }
  ]);
  const [activePageId, setActivePageId] = useState<string>('1');
  const [fontFamily, setFontFamily] = useState<FontFamily>('Inter');
  const [fontSize, setFontSize] = useState<number>(16);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState<string>('#1a1a2e');
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderline, setIsUnderline] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [paragraphSpacing, setParagraphSpacing] = useState<number>(1);
  const [editMode, setEditMode] = useState<'global' | 'selection'>('global');
  const [showFontLibrary, setShowFontLibrary] = useState<boolean>(false);
  const [showIconLibrary, setShowIconLibrary] = useState<boolean>(false);
  const [showPagePanel, setShowPagePanel] = useState<boolean>(true);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [pageOrientation, setPageOrientation] = useState<PageOrientation>('portrait');
  const [wordCount, setWordCount] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDraggingImage, setIsDraggingImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = pages.find(page => page.id === activePageId) || pages[0];

  const updateWordCount = useCallback(() => {
    const words = activePage.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [activePage.content]);

  useEffect(() => {
    updateWordCount();
    const interval = setInterval(updateWordCount, 1000);
    return () => clearInterval(interval);
  }, [updateWordCount]);

  const handleAddPage = () => {
    const newPageId = (pages.length + 1).toString();
    setPages([...pages, { id: newPageId, content: '', images: [] }]);
    setActivePageId(newPageId);
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter(page => page.id !== pageId);
    setPages(newPages);
    if (pageId === activePageId) {
      setActivePageId(newPages[0].id);
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    const pageToDuplicate = pages.find(page => page.id === pageId);
    if (!pageToDuplicate) return;
    
    const newPageId = (pages.length + 1).toString();
    const duplicatedPage: DocumentPage = {
      id: newPageId,
      content: pageToDuplicate.content,
      images: [...pageToDuplicate.images.map(img => ({ ...img }))]
    };
    
    setPages([...pages, duplicatedPage]);
    setActivePageId(newPageId);
  };

  const handleReorderPages = (dragIndex: number, hoverIndex: number) => {
    const newPages = [...pages];
    const [draggedPage] = newPages.splice(dragIndex, 1);
    newPages.splice(hoverIndex, 0, draggedPage);
    setPages(newPages);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newImage = {
          id: `img-${Date.now()}`,
          url: imageUrl,
          x: 100,
          y: 100,
          width: 200,
          height: 150
        };

        setPages(pages.map(page => 
          page.id === activePageId 
            ? { ...page, images: [...page.images, newImage] }
            : page
        ));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageDragStart = (imageId: string) => {
    setIsDraggingImage(imageId);
  };

  const handleImageDragEnd = () => {
    setIsDraggingImage(null);
  };

  const handleImageMove = (imageId: string, x: number, y: number) => {
    setPages(pages.map(page =>
      page.id === activePageId
        ? {
            ...page,
            images: page.images.map(img =>
              img.id === imageId ? { ...img, x, y } : img
            )
          }
        : page
    ));
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const element = document.createElement('a');
    element.href = '#';
    element.download = `document-${Date.now()}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsExporting(false);
    setShowExportMenu(false);
  };

  const handleExportTXT = () => {
    const element = document.createElement('a');
    const content = pages.map(page => page.content).join('\n\n--- Page Break ---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = `document-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
    setShowExportMenu(false);
  };

  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      pages,
      settings: {
        fontFamily,
        fontSize,
        pageSize,
        pageOrientation
      }
    };
    
    const element = document.createElement('a');
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
    element.href = URL.createObjectURL(blob);
    element.download = `project-${Date.now()}.dfp`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleEditorInput = (content: string) => {
    setPages(pages.map(page =>
      page.id === activePageId ? { ...page, content } : page
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white pb-24">
      <header className="sticky top-0 z-50 bg-[#0f3460]/90 backdrop-blur-md border-b border-[#e94584]/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[#e94584]/20"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-2">
                <FileText className="text-[#00b4d8]" size={28} />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#e94584] to-[#00b4d8] bg-clip-text text-transparent">
                    DocuForge Pro
                  </h1>
                  <p className="text-xs text-gray-400">Da forma a tus ideas</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleSaveProject}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#e94584] to-[#00b4d8] hover:opacity-90 transition-opacity"
              >
                <Save size={18} />
                <span>Guardar Proyecto</span>
              </button>
              
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-[#00b4d8]/50 hover:bg-[#00b4d8]/10 transition-colors"
              >
                <Download size={18} />
                <span>Exportar</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-2 rounded-lg hover:bg-[#e94584]/20"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              <span className="text-sm">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-2 rounded-lg hover:bg-[#e94584]/20"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showExportMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-4 top-full mt-2 w-64 bg-[#0f3460] border border-[#00b4d8]/30 rounded-lg shadow-xl z-50"
              >
                <div className="p-3">
                  <h3 className="font-semibold mb-2 text-[#00b4d8]">Exportar Documento</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#e94584]/10 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText size={18} />
                        <span>Exportar como PDF</span>
                      </div>
                      {isExporting && (
                        <div className="animate-pulse h-2 w-2 rounded-full bg-[#00b4d8]" />
                      )}
                    </button>
                    <button
                      onClick={handleExportTXT}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#e94584]/10 transition-colors"
                    >
                      <FileText size={18} />
                      <span>Exportar como TXT</span>
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-[#e94584]/10 transition-colors"
                    >
                      <Save size={18} />
                      <span>Guardar Proyecto (.dfp)</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-[#e94584]/10">
          <div className="container mx-auto px-4 py-2 overflow-x-auto">
            <div className="flex items-center space-x-4 min-w-max">
              <div className="flex items-center space-x-2">
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value as 'global' | 'selection')}
                  className="bg-transparent border border-[#00b4d8]/30 rounded px-3 py-1 text-sm"
                >
                  <option value="global">Edición Global</option>
                  <option value="selection">Edición por Selección</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`p-2 rounded ${isBold ? 'bg-[#e94584]/20' : 'hover:bg-[#e94584]/10'}`}
                  aria-label="Negrita"
                >
                  <Bold size={18} />
                </button>
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-2 rounded ${isItalic ? 'bg-[#e94584]/20' : 'hover:bg-[#e94584]/10'}`}
                  aria-label="Cursiva"
                >
                  <Italic size={18} />
                </button>
                <button
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-2 rounded ${isUnderline ? 'bg-[#e94584]/20' : 'hover:bg-[#e94584]/10'}`}
                  aria-label="Subrayado"
                >
                  <Underline size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`p-2 rounded ${textAlign === 'left' ? 'bg-[#00b4d8]/20' : 'hover:bg-[#00b4d8]/10'}`}
                  aria-label="Alinear izquierda"
                >
                  <AlignLeft size={18} />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`p-2 rounded ${textAlign === 'center' ? 'bg-[#00b4d8]/20' : 'hover:bg-[#00b4d8]/10'}`}
                  aria-label="Centrar"
                >
                  <AlignCenter size={18} />
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`p-2 rounded ${textAlign === 'right' ? 'bg-[#00b4d8]/20' : 'hover:bg-[#00b4d8]/10'}`}
                  aria-label="Alinear derecha"
                >
                  <AlignRight size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="bg-transparent border border-[#00b4d8]/30 rounded px-3 py-1 text-sm"
                >
                  {['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display'].map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>

                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 16)}
                  min="8"
                  max="72"
                  className="w-16 bg-transparent border border-[#00b4d8]/30 rounded px-3 py-1 text-sm"
                />

                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer bg-transparent border border-[#00b4d8]/30 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#0f3460]/50 rounded-lg p-4 border border-[#00b4d8]/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#00b4d8]">Páginas</h2>
                <button
                  onClick={handleAddPage}
                  className="p-2 rounded-lg hover:bg-[#e94584]/20"
                  aria-label="Agregar página"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              <div className="space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activePageId === page.id ? 'bg-[#e94584]/20' : 'hover:bg-[#00b4d8]/10'}`}
                    onClick={() => setActivePageId(page.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="text-gray-400" size={16} />
                      <span>Página {index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePage(page.id);
                        }}
                        className="p-1 rounded hover:bg-[#00b4d8]/20"
                        aria-label="Duplicar página"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.id);
                        }}
                        className="p-1 rounded hover:bg-[#e94584]/20"
                        aria-label="Eliminar página"
                        disabled={pages.length <= 1}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#0f3460]/50 rounded-lg p-4 border border-[#00b4d8]/20">
              <h2 className="text-lg font-semibold text-[#00b4d8] mb-4">Estadísticas</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Palabras</p>
                  <p className="text-xl font-semibold">{wordCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Páginas</p>
                  <p className="text-xl font-semibold">{pages.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Imágenes</p>
                  <p className="text-xl font-semibold">{activePage.images.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-[#0f3460]/50 rounded-lg p-6 border border-[#00b4d8]/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#00b4d8]">Editor de Documentos</h2>
                  <p className="text-sm text-gray-400">Edita tu contenido aquí</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-[#00b4d8]/50 hover:bg-[#00b4d8]/10 cursor-pointer transition-colors"
                  >
                    <ImageIcon size={18} />
                    <span>Insertar Imagen</span>
                  </label>
                </div>
              </div>

              <div 
                ref={editorRef}
                className="relative min-h-[600px] bg-white rounded-lg overflow-hidden flex flex-col"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <div 
                  className="p-8 flex-grow flex flex-col"
                  style={{
                    backgroundColor,
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    lineHeight,
                    textAlign
                  }}
                >
                  <textarea
                    value={activePage.content}
                    onChange={(e) => handleEditorInput(e.target.value)}
                    className="w-full flex-grow bg-transparent border-none outline-none resize-none"
                    placeholder="Comienza a escribir aquí..."
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      lineHeight,
                      textAlign,
                      fontWeight: isBold ? 'bold' : 'normal',
                      fontStyle: isItalic ? 'italic' : 'normal',
                      textDecoration: isUnderline ? 'underline' : 'none'
                    }}
                  />
                  
                  {activePage.images.map((image) => (
                    <div
                      key={image.id}
                      className="absolute cursor-move border-2 border-dashed border-[#00b4d8] rounded"
                      style={{
                        left: `${image.x}px`,
                        top: `${image.y}px`,
                        width: `${image.width}px`,
                        height: `${image.height}px`,
                        borderColor: isDraggingImage === image.id ? '#e94584' : '#00b4d8'
                      }}
                      draggable
                      onDragStart={() => handleImageDragStart(image.id)}
                      onDragEnd={handleImageDragEnd}
                      onDrag={(e) => {
                        if (e.clientX && e.clientY && editorRef.current) {
                          const rect = editorRef.current.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          handleImageMove(image.id, x, y);
                        }
                      }}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
