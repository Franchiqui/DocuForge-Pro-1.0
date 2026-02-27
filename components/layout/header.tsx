'use client';

'use client';

import React, { memo, useState, useCallback, useEffect } from 'react';
import { 
  Bars3Icon, 
  FolderIcon, 
  DocumentIcon, 
  PhotoIcon,
  FontAwesomeIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  BellIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { 
  Bars3BottomLeftIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/20/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headerVariants = cva(
  'sticky top-0 z-50 w-full border-b transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-[#0f3460]/50',
        scrolled: 'bg-[#0f3460]/95 backdrop-blur-md border-[#0f3460] shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface HeaderProps extends VariantProps<typeof headerVariants> {
  onMenuToggle?: () => void;
  onExportClick?: () => void;
  onSaveClick?: () => void;
  onNewDocument?: () => void;
  onOpenFile?: () => void;
  documentName?: string;
  wordCount?: number;
  pageCount?: number;
  currentPage?: number;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const Header = memo(function Header({
  onMenuToggle,
  onExportClick,
  onSaveClick,
  onNewDocument,
  onOpenFile,
  documentName = 'Sin título',
  wordCount = 0,
  pageCount = 1,
  currentPage = 1,
  isDarkMode = true,
  onThemeToggle,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowSearch(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setShowSearch(false);
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => document.removeEventListener('keydown', handleKeyDown as any);
  }, [handleKeyDown]);

  return (
    <header className={cn(headerVariants({ variant: isScrolled ? 'scrolled' : 'default' }))}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo y menú móvil */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-[#0f3460] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584] lg:hidden"
              aria-label="Abrir menú"
            >
              <span className="sr-only">Abrir menú</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex-shrink-0">
                <Bars3BottomLeftIcon className="h-8 w-8 bg-gradient-to-r from-[#e94584] to-[#00b4d8] bg-clip-text text-transparent" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">DocuForge Pro</h1>
                <p className="text-xs text-gray-400">Da forma a tus ideas</p>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-4">
              <button
                onClick={onNewDocument}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors duration-200"
                aria-label="Nuevo documento"
              >
                Nuevo
              </button>
              <button
                onClick={onOpenFile}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors duration-200"
                aria-label="Abrir archivo"
              >
                Abrir
              </button>
              <button
                onClick={onSaveClick}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors duration-200"
                aria-label="Guardar documento"
              >
                Guardar
              </button>
              <div className="relative">
                <button
                  onClick={onExportClick}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#0f3460] hover:text-white transition-colors duration-200 flex items-center"
                  aria-label="Exportar documento"
                  aria-haspopup="true"
                >
                  Exportar
                  <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </nav>
          </div>

          {/* Document info y búsqueda */}
          <div className="flex items-center space-x-4">
            {/* Información del documento - desktop */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-medium text-white truncate max-w-xs">
                {documentName}
              </span>
              <div className="flex space-x-3 text-xs text-gray-400">
                <span>{wordCount.toLocaleString()} palabras</span>
                <span>Página {currentPage} de {pageCount}</span>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="relative">
              <AnimatePresence>
                {showSearch ? (
                  <motion.div
                    initial={{ width: 40 }}
                    animate={{ width: 240 }}
                    exit={{ width: 40 }}
                    className="overflow-hidden"
                  >
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="search"
                        placeholder="Buscar en documento..."
                        className="w-full rounded-md border border-[#0f3460] bg-[#0f3460]/50 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-[#e94584] focus:outline-none focus:ring-1 focus:ring-[#e94584]"
                        autoFocus
                        onBlur={() => setShowSearch(false)}
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </form>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="rounded-md p-2 text-gray-400 hover:bg-[#0f3460] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584]"
                    aria-label="Buscar"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="rounded-md p-2 text-gray-400 hover:bg-[#0f3460] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584] relative"
                aria-label="Notificaciones"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-[#e94584] to-[#00b4d8]"></span>
              </button>
            </div>

            {/* Ayuda */}
            <button
              type="button"
              className="hidden md:inline-flex rounded-md p-2 text-gray-400 hover:bg-[#0f3460] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584]"
              aria-label="Ayuda"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>

            {/* Tema */}
            <button
              type="button"
              onClick={onThemeToggle}
              className="rounded-md p-2 text-gray-400 hover:bg-[#0f3460] hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584]"
              aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Perfil de usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center rounded-full p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#e94584]"
                aria-label="Menú de usuario"
                aria-haspopup="true"
              >
                <UserCircleIcon className="h-8 w-8" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-[#0f3460] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z -50"
                    role="menu"
                  >
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#16213e] hover:text-white"
                      role="menuitem"
                    >
                      Tu perfil
                    </a>
                    <a
                      href="#"
                      className="block px-4 py -2 text-sm text-gray -300 hover :bg -[#16213e] hover :text -white "
                      role ="menuitem "
                    >
                      Configuración
                    </a >
                    <a 
                      href ="#" 
                      className ="block px -4 py -2 text -sm text -gray -300 hover :bg -[#16213e] hover :text -white "
                      role ="menuitem "
                    >
                      Cerrar sesión
                    </a >
                  </motion.div >
                )}
              </AnimatePresence >
            </div >
          </div >
        </div >

        {/* Barra de estado móvil */}
        <div className ="lg:hidden border-t border-[#0f3460]/50 mt -2 pt -2 ">
          <div className ="flex items-center justify-between text-xs text-gray -400 ">
            <span className ="truncate ">{documentName}</span >
            <div className ="flex space-x -4 ">
              <span >{wordCount.toLocaleString()} palabras</span >
              <span >Pág {currentPage}/{pageCount}</span >
            </div >
          </div >
        </div >
      </div >
    </header >
  );
});

Header.displayName = 'Header';

export default Header;