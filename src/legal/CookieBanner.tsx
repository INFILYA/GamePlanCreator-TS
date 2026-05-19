import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { COOKIE_CONSENT_KEY } from "./constants";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (accepted === "true") return;

    setVisible(true);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function acceptCookies() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setEntered(false);
    window.setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
        entered ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-left text-sm leading-relaxed text-slate-700">
            We use cookies and similar technologies to keep you signed in,
            remember preferences, and understand how GamePlan Creator is used.
            See our{" "}
            <Link
              to="/privacy"
              className="font-medium text-blue-700 underline hover:text-blue-900"
            >
              Privacy Policy
            </Link>{" "}
            for details.
          </p>
          <button
            type="button"
            onClick={acceptCookies}
            className="shrink-0 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
