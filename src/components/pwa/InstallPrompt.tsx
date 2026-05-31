import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) {
      return;
    }

    setIsIos(isIosDevice());

    const dismissed = localStorage.getItem("cashpilot-install-dismissed");

    if (dismissed === "true") {
      return;
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosDevice()) {
      const timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 1800);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }

    setInstallEvent(null);
  }

  function handleDismiss() {
    localStorage.setItem("cashpilot-install-dismissed", "true");
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md rounded-[1.75rem] border border-white/70 bg-white/95 p-4 shadow-2xl shadow-slate-300/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/50 lg:bottom-6 lg:left-auto lg:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Smartphone size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">
                Install Money Map
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                Add it to your phone or desktop for a more app-like experience.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              aria-label="Dismiss install prompt"
            >
              <X size={18} />
            </button>
          </div>

          {isIos ? (
            <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              On iPhone: tap <strong>Share</strong>, then tap{" "}
              <strong>Add to Home Screen</strong>.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstall}
              disabled={!installEvent}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:shadow-black/30"
            >
              <Download size={18} />
              Install app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}