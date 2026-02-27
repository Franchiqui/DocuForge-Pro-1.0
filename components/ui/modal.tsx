'use client';

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const modalVariants = cva(
  'fixed inset-0 z-50 overflow-y-auto',
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
        xl: '',
        full: '',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const panelVariants = cva(
  'relative transform overflow-hidden rounded-lg bg-[#0f3460] text-left shadow-xl transition-all border border-[#1a1a2e]',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        full: 'w-full max-w-7xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
  panelClassName?: string;
  overlayClassName?: string;
}

const Modal = React.memo(function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  initialFocus,
  className,
  panelClassName,
  overlayClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <Dialog
          as="div"
          className={cn(modalVariants({ size }), className)}
          open={isOpen}
          onClose={onClose}
          initialFocus={initialFocus || closeButtonRef}
          static
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={handleOverlayClick}
          />

          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                panelVariants({ size }),
                panelClassName,
                'max-h-[90vh] flex flex-col'
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between border-b border-[#1a1a2e] px-6 py-4">
                  {title && (
                    <Dialog.Title
                      id="modal-title"
                      className="text-lg font-semibold text-white"
                    >
                      {title}
                    </Dialog.Title>
                  )}
                  {showCloseButton && (
                    <button
                      ref={closeButtonRef}
                      type="button"
                      className="rounded-md p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e94584] focus:ring-offset-2 focus:ring-offset-[#0f3460] transition-colors duration-200"
                      onClick={onClose}
                      aria-label="Close modal"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {description && (
                <div className="px-6 pt-4">
                  <Dialog.Description
                    id="modal-description"
                    className="text-sm text-gray-300"
                  >
                    {description}
                  </Dialog.Description>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>

              <div className="border-t border-[#1a1a2e] px-6 py-4 bg-gradient-to-r from-[#0f3460] to-[#16213e]">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:ring-offset-2 rounded-md transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#e94584] to-[#00b4d8] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e94584] focus:ring-offset-2 rounded-md transition-all duration-200"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';

export { Modal };