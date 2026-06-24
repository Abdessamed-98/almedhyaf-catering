import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';

type Toast = { id: number; message: string };
type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Trigger a branded snackbar from anywhere inside <ToastProvider>. */
export const useToast = (): ShowToast => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback<ShowToast>((message) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-28 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 bg-ink text-white ps-2 pe-5 py-2 rounded-full shadow-2xl shadow-ink/30 animate-fade-in-up border border-white/10"
          >
            <span className="w-6 h-6 rounded-full bg-secondary-500 text-ink flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </span>
            <span className="text-sm font-bold whitespace-nowrap">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
