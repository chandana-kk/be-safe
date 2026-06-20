export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-accent" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-charcoal/60 dark:text-offwhite/60 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
