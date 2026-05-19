import { LegalPageLayout } from "./LegalPageLayout";
import { SUPPORT_EMAIL } from "./constants";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 2026">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          1. Compliance (PIPEDA)
        </h2>
        <p>
          This Privacy Policy describes how GamePlan Creator (&quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects
          personal information in accordance with Canada&apos;s Personal
          Information Protection and Electronic Documents Act (PIPEDA) and
          applicable Ontario privacy guidelines.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          2. Information We Collect
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>
            <strong>Authentication data:</strong> Email addresses and account
            identifiers collected through Firebase Authentication when you sign
            in or register.
          </li>
          <li>
            <strong>Operational and usage data:</strong> Information about how you
            use the Tool (for example, feature interactions, session activity, and
            technical logs) to maintain and improve the Service.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> Small files stored
            on your device to remember preferences, maintain sessions, and
            understand aggregate usage. See our cookie notice at the bottom of the
            app.
          </li>
          <li>
            <strong>Billing details:</strong> If you subscribe to paid features,
            payment card and billing information are collected and processed
            securely by Stripe. We do not store full payment card numbers on our
            servers.
          </li>
          <li>
            <strong>User-generated tactical data:</strong> Game plans, scouting
            reports, player notes, and related content you choose to store in the
            Tool.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          3. Coach and Team Data — Your Representations
        </h2>
        <p>
          If you input proprietary team strategies, scouting intelligence, or
          personal information about athletes or staff, you represent and warrant
          that you have obtained all necessary legal rights, consents, and
          authorizations to collect, use, and store that information in GamePlan
          Creator. We rely on you to comply with applicable privacy, employment,
          league, and youth-protection obligations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          4. How We Use Information
        </h2>
        <p>We use personal information to:</p>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>Provide, authenticate, and secure your account;</li>
          <li>Store and sync your tactical content within the Tool;</li>
          <li>Process subscriptions and payments through Stripe;</li>
          <li>Monitor performance, prevent abuse, and improve the Service;</li>
          <li>Respond to support requests and legal obligations.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">5. Data Security</h2>
        <p>
          Game plans, scouting data, and account-linked content are protected using
          Firebase security rules and industry-standard access controls. While we
          implement reasonable safeguards, no method of transmission or storage is
          completely secure.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">
          6. Third-Party Processors
        </h2>
        <p>
          We use trusted service providers, including Google Firebase (hosting,
          authentication, and database) and Stripe (payments). These providers
          process data according to their own privacy policies and contractual
          obligations. We encourage you to review their documentation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">7. Your Rights</h2>
        <p>
          Under PIPEDA, you may request access to, correction of, or deletion of
          your personal information, subject to legal and operational requirements.
          Contact us using the email below to exercise these rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-900">8. Contact</h2>
        <p>
          Privacy inquiries may be sent to{" "}
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
