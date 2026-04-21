export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      {Icon && (
        <div className="w-16 h-16 bg-steel/30 rounded-full flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-500" />
        </div>
      )}
      <h3 className="text-white font-display font-bold text-lg mb-1">{title}</h3>
      <p className="text-slate-500 text-sm font-body max-w-xs mb-4">{message}</p>
      {action}
    </div>
  );
}
