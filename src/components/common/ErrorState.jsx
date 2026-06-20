import { AlertCircle } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-coral" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-charcoal/60 dark:text-offwhite/60 text-sm max-w-xs mb-6">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  );
}
