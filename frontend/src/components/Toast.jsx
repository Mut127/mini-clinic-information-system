// src/components/Toast.jsx
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 2500 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;

    setProgress(100);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 30);

    const timer = setTimeout(onClose, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={32} className="text-green-500" />
            ) : (
              <XCircle size={32} className="text-red-500" />
            )}
          </div>

          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Progress bar hitung mundur auto-dismiss */}
        <div className="h-1 bg-slate-100">
          <div
            className={`h-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${progress}%`, transition: 'width 30ms linear' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;