'use client';

'use client';

import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PhotoIcon,
  FontFamilyIcon,
  ViewColumnsIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  DuplicateIcon,
  ArrowsUpDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Page {
  id: string;
  title: string;
  thumbnail: string;
  pageNumber: number;
}

interface Font {
  id: string;
  name: string;
  family: string;
  category: 'sans' | 'serif' | 'mono' | 'display';
}

interface Icon {
  id: string;
  name: string;
  category: string;
  svgPath: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePanel?: 'pages' | 'fonts' | 'icons' | 'files' | 'export';
  pages: Page[];
  onPageSelect: (pageId: string) => void;
  onPageAdd: () => void;
  onPageDelete: (pageId: string) => void;
  onPageDuplicate: (pageId: string) => void;
  onPageReorder: (fromIndex: number, toIndex: number) => void;
  selectedFont?: Font;
  onFontSelect: (font: Font) => void;
  onImageUpload: (file: File) => void;
  onExportPDF: () => void;
  onExportTXT: () => void;
  onSaveProject: () => void;
}

const SIDEBAR_SECTIONS = [
  { id: 'pages', label: 'Páginas', icon: ViewColumnsIcon },
  { id: 'fonts', label: 'Fuentes', icon: FontFamilyIcon },
  { id: 'icons', label: 'Iconos', icon: PhotoIcon },
  { id: 'files', label: 'Archivos', icon: FolderIcon },
  { id: 'export', label: 'Exportar', icon: ArrowDownTrayIcon },
] as const;

const FONTS_LIBRARY: Font[] = [
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", category: 'sans' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", category: 'sans' },
  { id: 'opensans', name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'sans' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", category: 'serif' },
  { id: 'robotomono', name: 'Roboto Mono', family: "'Roboto Mono', monospace", category: 'mono' },
];

const ICONS_LIBRARY: Icon[] = [
  { id: 'doc', name: 'Documento', category: 'negocios', svgPath: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' },
];

const Sidebar = memo<SidebarProps>(function Sidebar({
  isOpen,
  onToggle,
  activePanel = 'pages',
  pages,
  onPageSelect,
  onPageAdd,
  onPageDelete,
  onPageDuplicate,
  onPageReorder,
  selectedFont,
  onFontSelect,
  onImageUpload,
  onExportPDF,
  onExportTXT,
  onSaveProject,
}) {
  const [internalActivePanel, setInternalActivePanel] = useState(activePanel);
  const [dragOver, setDragOver] = useState(false);
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null);
  
  useEffect(() => {
    setInternalActivePanel(activePanel);
  }, [activePanel]);
  
  const handleDragStart = useCallback((e: React.DragEvent, pageId: string) => {
    e.dataTransfer.setData('text/plain', pageId);
    setDraggingPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
    
    if (e.dataTransfer.setDragImage && e.target instanceof HTMLElement) {
      const dragImage = e.target.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.5';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, e.clientX - e.target.getBoundingClientRect().left, e.clientY - e.target.getBoundingClientRect().top);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
    
    e.currentTarget.classList.add('opacity-50');
    
    const handleDragEnd = () => {
      setDraggingPageId(null);
      e.currentTarget.classList.remove('opacity-50');
      document.removeEventListener('dragend', handleDragEnd);
    };
    
    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOver(true);
    }, []);
    
    const handleDragLeave = useCallback(() => {
      setDragOver(false);
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent, targetIndex?: number) => {
      e.preventDefault();
      setDragOver(false);
      
      const pageId = e.dataTransfer.getData('text/plain');
      if (!pageId) return;
      
      const draggedIndex = pages.findIndex(p => p.id === pageId);
      if (draggedIndex === -1) return;
      
      const dropIndex = targetIndex ?? pages.length - (e.currentTarget.getAttribute('data-dropzone') === 'end' ? -1 : pages.length - draggedIndex);
      
      if (draggedIndex !== dropIndex && dropIndex >= -1 && dropIndex <= pages.length) {
        const finalIndex = dropIndex === -1 ? pages.length - (e.currentTarget.getAttribute('data-dropzone') === 'end' ? -1 : pages.length - draggedIndex) : dropIndex;
        onPageReorder(draggedIndex, finalIndex);
      }
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pages, onPageReorder]);
    
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
      e.target.value = '';
    }, [onImageUpload]);
    
    const cn = useCallback((...classes: (string | boolean | undefined)[]) => {
      return twMerge(clsx(classes));
    }, []);
    
    const renderPagesPanel = () => (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Páginas del Documento</h3>
          <button
            onClick={onPageAdd}
            className="p-2 rounded-lg bg-gradient-to-r from-[#e94584] to-[#00b4d8] text-white hover:opacity-90 transition-opacity"
            aria-label="Añadir nueva página"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {pages.map((page, index) => (
            <React.Fragment key={page.id}>
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, page.id)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  "group relative p-3 rounded-lg border border-[#0f3460] bg-[#0a2647] hover:bg-[#0d2e55] transition-colors cursor-move",
                  draggingPageId === page.id && "opacity-50"
                )}
                onClick={() => onPageSelect(page.id)}
                role="button"
                tabIndex={0}
                aria-label={`Seleccionar página ${page.pageNumber}: ${page.title}`}
                onKeyDown={(e) => e.key === 'Enter' && onPageSelect(page.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Página {page.pageNumber}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPageDuplicate(page.id);
                      }}
                      className="p-1 hover:text-[#00b4d8] transition-colors"
                      aria-label={`Duplicar página ${page.pageNumber}`}
                    >
                      <DuplicateIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPageDelete(page.id);
                      }}
                      className="p-1 hover:text-red-400 transition-colors"
                      aria-label={`Eliminar página ${page.pageNumber}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-gray-400 cursor-move" aria-hidden="true">
                      <ArrowsUpDownIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="aspect-[3/4] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded border border-[#0f3460] flex items-center justify-center">
                  <DocumentTextIcon className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              
              {index < pages.length - (draggingPageId ? (draggingPageId === page.id ? -1 : pages.length - index) : pages.length - index) && (
                <div
                  data-dropzone="between"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index + (draggingPageId ? (draggingPageId === page.id ? -1 : pages.length - index) : pages.length - index))}
                  className={cn(
                    "h-2 rounded-full transition-colors",
                    dragOver ? "bg-gradient-to-r from-[#e94584] to-[#00b4d8]" : "bg-transparent"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div
          data-dropzone="end"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "mt-4 p-4 rounded-lg border-2 border-dashed transition-colors text-center",
            dragOver 
              ? "border-gradient-to-r from-[#e94584] to-[#00b4d8] bg-gradient-to-r from-[#e94584]/10 to-[#00b4d8]/10" 
              : "border-[#0f3460] hover:border-[#00b4d8]"
          )}
        >
          <p className="text-sm text-gray-400">Arrastra páginas aquí para reordenar</p>
        </div>
      </div>
    );
    
    const renderFontsPanel = () => (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Biblioteca de Fuentes</h3>
        
        <div className="space-y-2">
          {FONTS_LIBRARY.map((font) => (
            <button
              key={font.id}
              onClick={() => onFontSelect(font)}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all",
                selectedFont?.id === font.id
                  ? "border-gradient-to-r from-[#e94584] to-[#00b4d8] bg-gradient-to-r from-[#e94584]/20 to-[#00b4d8]/20"
                  : "border-[#0f3460] bg-[#0a2647] hover:bg-[#0d2e55]"
              )}
              style={{ fontFamily: font.family }}
              aria-label={`Seleccionar fuente ${font.name}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{font.name}</span>
                <span className="text-xs px-2 py-1 rounded bg-[#16213e] text-gray-300">
                  {font.category}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
              </p>
            </button>
          ))}
        </div>
        
        <div className="pt-4 border-t border-[#0f3460]">
          <label className="block mb-2 text-sm font-medium text-white">Cargar Fuente Personalizada</label>
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#0f3460] bg-[#0a2647] text-white file:text-white file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300 file:cursor-pointer file:hover:text-gray-300"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log('Font uploaded:', file.name);
              }
            }}
            aria-label="Cargar fuente personalizada"
          />
        </div>
      </div>
    );
    
    const renderIconsPanel = () => (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Biblioteca de Iconos</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {ICONS_LIBRARY.map((icon) => (
            <button
              key={icon.id}
              className="p-3 rounded-lg border border-[#0f3460] bg-[#0a2647] hover:bg-[#0d2e55] transition-colors group"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(icon));
                e.dataTransfer.effectAllowed = 'copy';
                
                if (}}}})))))