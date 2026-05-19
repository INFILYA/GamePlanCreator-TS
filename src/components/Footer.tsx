import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
      <p className="mb-2">
        © {year} GamePlan Creator · Pylyp Harmash. All rights reserved.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link
          to="/terms"
          className="text-blue-700 underline hover:text-blue-900"
        >
          Terms of Service
        </Link>
        <span aria-hidden="true" className="text-slate-300">
          |
        </span>
        <Link
          to="/privacy"
          className="text-blue-700 underline hover:text-blue-900"
        >
          Privacy Policy
        </Link>
      </nav>
    </footer>
  );
}
