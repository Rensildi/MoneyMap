import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw } from "lucide-react";

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed left-4 right-4 top-4 z-[70] mx-auto max-w-md rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 shadow-xl shadow-blue-100 dark:border-blue-900/50 dark:bg-blue-950 dark:shadow-black/40">
      <p className="font-semibold text-blue-900 dark:text-blue-100">
        A new version of CashPilot is available.
      </p>

      <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
        Refresh to get the latest improvements.
      </p>

      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <RefreshCw size={18} />
        Refresh app
      </button>
    </div>
  );
}