"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { submitFeedback } from "@/app/actions/feedback";

type Panel = null | "receive" | "give";

const INITIAL_STATE = { error: undefined as string | undefined, success: false };

export default function SupportWidget() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [state, formAction, pending] = useActionState(submitFeedback, INITIAL_STATE);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openPanel(p: Panel) {
    setPanel(p);
    setExpanded(false);
  }

  function close() {
    setExpanded(false);
    setPanel(null);
  }

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* Expanded action buttons */}
      {expanded && !panel && (
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => openPanel("give")}
            className="rounded-full bg-white border border-stone-200 shadow-sm px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Give Support
          </button>
          <button
            onClick={() => openPanel("receive")}
            className="rounded-full bg-white border border-stone-200 shadow-sm px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Receive Support
          </button>
        </div>
      )}

      {/* Receive Support panel */}
      {panel === "receive" && (
        <div className="w-80 rounded-2xl bg-white border border-stone-200 shadow-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-stone-900">How can we help?</p>
            <button onClick={close} className="text-stone-400 hover:text-stone-600 text-lg leading-none">×</button>
          </div>

          {state.success ? (
            <div className="space-y-2">
              <p className="text-stone-700 text-sm">Got it — thank you. We'll follow up if you left contact info.</p>
              <button onClick={close} className="text-sm text-stone-500 underline hover:text-stone-700">Close</button>
            </div>
          ) : (
            <form action={formAction} className="space-y-3">
              <input type="hidden" name="type" value="support" />
              <input type="hidden" name="page_path" value={pathname} />
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Tell us what's going on — anything is fine."
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 resize-none"
              />
              <input
                name="contact"
                type="text"
                placeholder="Email or contact (optional)"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100"
              />
              {state.error && (
                <p className="text-xs text-red-600">{state.error}</p>
              )}
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                {pending ? "Sending…" : "Send"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Give Support panel */}
      {panel === "give" && (
        <div className="w-80 rounded-2xl bg-white border border-stone-200 shadow-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-stone-900">Support CommonGround</p>
            <button onClick={close} className="text-stone-400 hover:text-stone-600 text-lg leading-none">×</button>
          </div>

          {state.success ? (
            <div className="space-y-2">
              <p className="text-stone-700 text-sm">Thank you — we really mean it.</p>
              <button onClick={close} className="text-sm text-stone-500 underline hover:text-stone-700">Close</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-stone-600 leading-relaxed">
                Financial contributions are coming soon. We&apos;ll keep the fee structure transparent and everything above operating costs goes back into the platform and community grants.
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                The best thing you can do right now is share CommonGround with a neighbor.
              </p>
              <form action={formAction} className="space-y-3">
                <input type="hidden" name="type" value="give" />
                <input type="hidden" name="page_path" value={pathname} />
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Want to say something? We'd love to hear it."
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-100 resize-none"
                />
                {state.error && (
                  <p className="text-xs text-red-600">{state.error}</p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm text-white font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  {pending ? "Sending…" : "Send a note"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => {
          if (panel) { close(); } else { setExpanded((v) => !v); }
        }}
        className="rounded-full bg-stone-900 px-5 py-3 text-sm text-white font-medium shadow-lg hover:bg-stone-700 transition-colors"
      >
        Support
      </button>

    </div>
  );
}
