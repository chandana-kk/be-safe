export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-charcoal/10 dark:bg-white/10 text-charcoal/70 dark:text-offwhite/70',
    offline: 'bg-teal/15 text-teal dark:text-teal',
    demo: 'bg-warning/15 text-warning',
    emergency: 'bg-coral/15 text-coral',
    accent: 'bg-accent/15 text-accent',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}
