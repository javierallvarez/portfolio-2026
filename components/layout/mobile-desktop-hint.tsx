"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "portfolio-mobile-desktop-hint-dismissed";

export function MobileDesktopHint({
  message,
  dismissAria,
}: {
  message: string;
  dismissAria: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }

    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      try {
        if (window.localStorage.getItem(STORAGE_KEY) === "1") {
          setVisible(false);
          return;
        }
      } catch {
        /* ignore */
      }
      setVisible(mq.matches);
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="border-border bg-surface text-foreground fixed right-4 bottom-4 left-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg md:hidden"
    >
      <div className="flex items-start gap-3">
        <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="text-muted hover:text-foreground shrink-0 rounded-md p-1 transition-colors"
          aria-label={dismissAria}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
