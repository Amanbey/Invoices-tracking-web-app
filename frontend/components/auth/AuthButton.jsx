export default function AuthButton({ children, isLoading, disabled, ...props }) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDisabled}
      type="submit"
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
      )}
      {children}
    </button>
  );
}
