import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: '✅',
    bg: 'bg-green-500',
    ring: 'ring-green-500/20',
  },
  error: {
    icon: '❌',
    bg: 'bg-red-500',
    ring: 'ring-red-500/20',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-blue-500',
    ring: 'ring-blue-500/20',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-yellow-500',
    ring: 'ring-yellow-500/20',
  },
};

function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearInterval(timer);
  }, [onClose, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl ring-1 ${config.ring} ${config.bg} text-white`}
    >
      <span className='text-xl'>{config.icon}</span>
      <p className='text-sm font-medium'>{message}</p>
      <button
        onClick={onClose}
        className='ml-2 text-white/80 hover:text-white transition'
      >
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    </motion.div>
  );
}

interface ToastContextType {
  showToast: (message: string, type: ToastProps['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  const showToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now();
    setToasts((prev) => [
      ...prev,
      { message, type, onClose: () => {}, id, duration: 3000 },
    ]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
