export function LoadingMessage({ message, className = 'mt-6' }: { message: string; className?: string }) {
  return <p className={`${className} text-center text-slate-300`}>{message}</p>;
}

/** Error state. The Retry button appears only for retryable failures; otherwise the user searches again. */
export function StatusMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between gap-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4 text-rose-100" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="shrink-0 rounded-lg bg-rose-200 px-3 py-2 font-semibold text-rose-950" type="button" onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}
