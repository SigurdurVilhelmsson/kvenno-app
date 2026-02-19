import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastType } from '@/types';

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast.show) return null;

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    warning: <AlertTriangle size={24} />,
    info: <Info size={24} />,
  };

  const colors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-kvenno-orange text-white',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] ${colors[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="font-medium">{toast.message}</span>
      </div>
    </div>
  );
};
