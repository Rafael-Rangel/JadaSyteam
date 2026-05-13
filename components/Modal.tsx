'use client';

import { ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: Size;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const sizeClass: Record<Size, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          className={`relative bg-white rounded-xl shadow-lg w-full ${sizeClass[size]} max-h-[calc(100vh-2rem)] flex flex-col animate-scale-in border border-neutral-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-xl">
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 id={titleId} className="text-base font-semibold text-neutral-900 truncate">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id={descId} className="mt-1 text-sm text-neutral-500">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div className="px-6 py-5 overflow-y-auto scrollbar-thin">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/50 rounded-b-xl sticky bottom-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
