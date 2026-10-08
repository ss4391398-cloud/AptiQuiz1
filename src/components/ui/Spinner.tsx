export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin ${className}`}
      style={{ width: size, height: size, borderWidth: size > 30 ? 4 : 3 }}
    />
  );
}

export function FullPageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner size={40} />
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  );
}
