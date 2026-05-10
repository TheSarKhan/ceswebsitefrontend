'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';
type Toast = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  show: (kind: ToastKind, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
  }, []);

  // Auto-dismiss the oldest toast after AUTO_DISMISS_MS.
  useEffect(() => {
    if (toasts.length === 0) return;
    const handle = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(handle);
  }, [toasts]);

  const value: ToastContextValue = {
    show,
    success: (m) => show('success', m),
    error: (m) => show('error', m),
    info: (m) => show('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={'admin-toast admin-toast-' + t.kind}
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
