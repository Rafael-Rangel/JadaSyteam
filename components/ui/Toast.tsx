'use client';

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type Tone = 'success' | 'warning' | 'danger' | 'info';

interface ToastItem {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (input: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => {
        if (typeof window !== 'undefined') {
          console.warn('useToast usado fora de <ToastProvider>.');
        }
      },
    };
  }
  return ctx;
}

const toneIcon = {
  success: <CheckCircle2 className="w-5 h-5 text-success-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-600" />,
  danger: <XCircle className="w-5 h-5 text-danger-600" />,
  info: <Info className="w-5 h-5 text-info-600" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: Omit<ToastItem, 'id'>) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...input, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <ToastView key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const ms = item.duration ?? 4000;
    const t = setTimeout(onClose, ms);
    return () => clearTimeout(t);
  }, [item.duration, onClose]);

  return (
    <div className="pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)] rounded-lg border border-neutral-200 bg-white shadow-md p-3 flex items-start gap-3 animate-scale-in">
      <div className="shrink-0 mt-0.5">{toneIcon[item.tone]}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-neutral-600">{item.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
