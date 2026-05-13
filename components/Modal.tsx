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
  sm: 'max-w-full sm:max-w-[420px]',
  md: 'max-w-full sm:max-w-[560px]',
  lg: 'max-w-full sm:max-w-[720px]',
  xl: 'max-w-full sm:max-w-[960px]',
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
      <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          className={`relative flex w-full flex-col border border-neutral-200 bg-white shadow-lg animate-scale-in
            max-h-[min(100dvh,100vh)] sm:max-h-[calc(100vh-2rem)]
            rounded-t-2xl sm:rounded-xl
            ${sizeClass[size]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6 sm:py-4 sticky top-0 z-10 rounded-t-2xl sm:rounded-t-xl">
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 id={titleId} className="truncate text-base font-semibold text-neutral-900 sm:text-lg">
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
                  className="-m-1 shrink-0 rounded-md p-2.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin sm:px-6 sm:py-5">
            {children}
          </div>

          {footer && (
            <div className="sticky bottom-0 z-10 rounded-b-2xl border-t border-neutral-200 bg-neutral-50/95 px-4 py-4 backdrop-blur-sm sm:rounded-b-xl sm:px-6 sm:py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
