export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6" role="status" aria-live="polite">
      <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
      <p className="text-charcoal/60 dark:text-offwhite/60 text-sm font-medium">{message}</p>
    </div>
  );
}
