import { LegalPageLayout } from "./LegalPageLayout";
import { SUPPORT_EMAIL } from "./constants";

export default function TermsOfService() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 2026">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">1. Acceptance</h2>
        <p>
          By accessing or using GamePlan Creator (the &quot;Service&quot;), you
          agree to be bound by these Terms of Service. If you do not agree, do
          not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">2. The Service</h2>
        <p>
          GamePlan Creator is a digital SaaS tool for tactical game planning and
          sports strategy organization (the &quot;Tool&quot;). The Tool is a
          tactical organization platform only. Pylyp Harmash (the
          &quot;Developer&quot;) provides the platform infrastructure; users are
          solely responsible for the tactical content they create, store, and
          share.
        </p>
        <p className="mt-3">
          The Service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis, without warranties of any kind, whether
          express or implied.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          3. Intellectual Property
        </h2>
        <p>
          The Tool&apos;s architecture, source code, design, branding, and
          underlying infrastructure are owned exclusively by Pylyp Harmash.
          Nothing in these Terms transfers ownership of the Tool to you.
        </p>
        <p className="mt-3">
          You retain ownership of your specific game plans, scouting reports, and
          other tactical data you input into the system, subject to the license
          granted below and your compliance with applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">4. License</h2>
        <p>
          Subject to these Terms, the Developer grants you a limited,
          non-exclusive, non-transferable, revocable license to use the Tool for
          personal or professional coaching and team organization purposes. You
          may not reverse-engineer, decompile, scrape, sublicense, or resell the
          Service without prior written consent from the Developer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          5. User Responsibilities
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account. You represent that
          you have the right to upload and process any team, player, or tactical
          information you enter into the Tool.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          6. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by applicable law, the Developer shall
          not be liable for any indirect, incidental, special, consequential, or
          punitive damages, including but not limited to data loss, service
          downtime, lost profits, or business interruption.
        </p>
        <p className="mt-3">
          The Developer is not liable for real-world sports or athletic outcomes,
          game results, player performance, injuries, or the effectiveness of
          any team strategies, plays, or scouting decisions made using the Tool.
          Tactical and competitive decisions remain solely your responsibility.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          7. Governing Law
        </h2>
        <p>
          These Terms are governed by the laws of the Province of Ontario and the
          federal laws of Canada applicable therein, without regard to conflict-of-law
          principles. You agree to submit to the exclusive jurisdiction of the courts
          located in Ontario, Canada.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">8. Contact</h2>
        <p>
          Questions about these Terms may be sent to{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-blue-700 underline hover:text-blue-900"
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
