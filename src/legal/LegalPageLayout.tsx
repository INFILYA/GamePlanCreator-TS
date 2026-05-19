import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 text-left sm:px-6 lg:px-8">
      <p className="mb-2 text-sm text-slate-500">
        <Link to="/" className="text-blue-700 underline hover:text-blue-900">
          ← Back to GamePlan Creator
        </Link>
      </p>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="mb-8 text-sm text-slate-500">Last Updated: {lastUpdated}</p>
      <div className="space-y-6 leading-relaxed text-slate-800">{children}</div>
    </article>
  );
}
