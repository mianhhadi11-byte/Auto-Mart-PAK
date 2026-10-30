import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
            <Icon size={19} />
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
